/**
 * AI Helper — CDC Đà Nẵng Zalo OA Chatbot
 * Hỗ trợ nhiều nhà cung cấp AI: Gemini & Groq
 */

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { prisma } from "@/lib/zalo-admin/prisma";

// ============================================================
// CACHE KIẾN THỨC (30 phút)
// ============================================================
let knowledgeBaseCache = null;
let knowledgeCacheTime = 0;
const KNOWLEDGE_CACHE_TTL = 30 * 60 * 1000;

// ============================================================
// CACHE DANH SÁCH TÀI LIỆU GOOGLE DRIVE (10 phút)
// ============================================================
let driveDocCache = null;
let driveDocCacheTime = 0;
const DRIVE_CACHE_TTL = 10 * 60 * 1000;

export async function loadDriveDocuments() {
  const now = Date.now();
  if (driveDocCache !== null && (now - driveDocCacheTime < DRIVE_CACHE_TTL)) {
    return driveDocCache;
  }
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: ["drive_folder_id", "google_api_key", "drive_refresh_token", "gmail_oauth_client_id", "gmail_oauth_client_secret"] } },
    });
    const folderId     = configs.find(c => c.key === "drive_folder_id")?.value;
    const apiKey       = configs.find(c => c.key === "google_api_key")?.value;
    const refreshToken = configs.find(c => c.key === "drive_refresh_token")?.value;
    const clientId     = configs.find(c => c.key === "gmail_oauth_client_id")?.value;
    const clientSecret = configs.find(c => c.key === "gmail_oauth_client_secret")?.value;

    if (!folderId) { driveDocCache = []; driveDocCacheTime = now; return []; }

    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const fields = encodeURIComponent("files(id,name,mimeType)");
    let headers = {};
    let url;

    if (apiKey) {
      // Chế độ đơn giản: Folder công khai + Google API Key
      url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&key=${apiKey}`;
    } else if (refreshToken && clientId && clientSecret) {
      // Chế độ OAuth2: Folder riêng tư, dùng refresh token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        console.error("[Drive OAuth] Không lấy được access_token:", tokenData);
        driveDocCache = []; driveDocCacheTime = now; return [];
      }
      url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100`;
      headers = { Authorization: `Bearer ${tokenData.access_token}` };
    } else {
      // Chưa cấu hình đủ
      driveDocCache = []; driveDocCacheTime = now; return [];
    }

    const res = await fetch(url, { headers });
    const json = await res.json();
    if (!res.ok || !json.files) {
      console.error("[Drive] Lỗi liệt kê file:", json);
      driveDocCache = []; driveDocCacheTime = now; return [];
    }

    driveDocCache = json.files.map(f => ({
      name: f.name,
      link: `https://drive.google.com/file/d/${f.id}/view`,
      download: `https://drive.google.com/uc?export=download&id=${f.id}`,
    }));
    driveDocCacheTime = now;
    return driveDocCache;
  } catch (e) {
    console.error("[Drive] Exception:", e.message);
    driveDocCache = [];
    driveDocCacheTime = now;
    return [];
  }
}

// ============================================================
// CACHE PROVIDER
// ============================================================
let cachedProvider = null;
let providerCacheTime = 0;
const PROVIDER_CACHE_TTL = 60 * 1000; // 1 phút

// ============================================================
// ROUND-ROBIN API KEY POOLS + SMART BLACKLIST
// ============================================================
// Blacklist: { [apiKey]: expiresAt (timestamp) }
// Khi key bị lỗi 429/503, nó vào blacklist 5 phút, sau đó tự phục hồi
const keyBlacklist = new Map();
const BLACKLIST_TTL = 2 * 60 * 1000; // 2 phút — đủ ngắn để tự phục hồi nhanh

function isKeyBlacklisted(apiKey) {
  const exp = keyBlacklist.get(apiKey);
  if (!exp) return false;
  if (Date.now() > exp) { keyBlacklist.delete(apiKey); return false; }
  return true;
}

function blacklistKey(apiKey) {
  keyBlacklist.set(apiKey, Date.now() + BLACKLIST_TTL);
  console.warn(`[KeyPool] Key bị blacklist 5 phút: ...${apiKey.slice(-6)}`);
}

let geminiKeyPool = [];
let geminiKeyPoolTime = 0;
let geminiCurrentIndex = 0;
let geminiModelIndex = 0;

let groqKeyPool = [];
let groqKeyPoolTime = 0;
let groqCurrentIndex = 0;

const API_KEY_CACHE_TTL = 5 * 60 * 1000;

async function loadKeyPool(provider) {
  const now = Date.now();
  if (provider === "gemini") {
    if (geminiKeyPool.length > 0 && (now - geminiKeyPoolTime < API_KEY_CACHE_TTL)) return geminiKeyPool;
    try {
      geminiKeyPool = await prisma.geminiApiKey.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
      geminiKeyPoolTime = now;
    } catch (e) {}
    return geminiKeyPool;
  } else {
    if (groqKeyPool.length > 0 && (now - groqKeyPoolTime < API_KEY_CACHE_TTL)) return groqKeyPool;
    try {
      groqKeyPool = await prisma.groqApiKey.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
      groqKeyPoolTime = now;
    } catch (e) {}
    return groqKeyPool;
  }
}

export function clearApiKeyCache() {
  geminiKeyPool = [];
  geminiKeyPoolTime = 0;
  geminiCurrentIndex = 0;
  geminiModelIndex = 0;
}

export function clearGroqKeyCache() {
  groqKeyPool = [];
  groqKeyPoolTime = 0;
  groqCurrentIndex = 0;
}

// ============================================================
// LỊCH SỬ HỘI THOẠI
// ============================================================
const conversationHistory = new Map();
const conversationTimestamps = new Map();
const CONVERSATION_TTL = 30 * 60 * 1000;
const MAX_HISTORY_TURNS = 10;

export async function loadKnowledgeBase() {
  const now = Date.now();
  if (knowledgeBaseCache && (now - knowledgeCacheTime < KNOWLEDGE_CACHE_TTL)) return knowledgeBaseCache;

  try {
    const docs = await prisma.aiKnowledge.findMany({ orderBy: { createdAt: "desc" } });
    if (docs.length === 0) {
      knowledgeBaseCache = [];
      knowledgeCacheTime = now;
      return [];
    }
    
    let chunks = [];
    for (const doc of docs) {
      chunks.push({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        content: doc.content,
        allowedDepartment: doc.allowedDepartment || null,
        // Embedding vector (768 chiều) cho semantic search — null nếu chưa generate
        embeddingVec: doc.embedding ? JSON.parse(doc.embedding) : null,
        normalized: removeVietnameseTones(doc.title + " " + doc.category + " " + doc.content).toLowerCase()
      });
    }
    
    knowledgeBaseCache = chunks;
    knowledgeCacheTime = now;
    return chunks;
  } catch (err) {
    return knowledgeBaseCache || [];
  }
}

export function clearKnowledgeCache() {
  knowledgeBaseCache = null;
  knowledgeCacheTime = 0;
}

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

function retrieveRelevantKnowledge(question, chunks) {
  if (!chunks || chunks.length === 0) return "";
  
  const normalizedQ = removeVietnameseTones(question).toLowerCase();
  const keywords = normalizedQ.split(/\s+/).filter(w => w.length > 1);
  
  if (keywords.length === 0) return "";

  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    for (const kw of keywords) {
      const count = chunk.normalized.split(kw).length - 1;
      score += count;
    }
    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.filter(c => c.score > 0).slice(0, 3);
  const selectedChunks = topChunks.length > 0 ? topChunks : chunks.slice(0, 3);
  
  let combinedText = "";
  for (const chunk of selectedChunks) {
    combinedText += `\n\n[CHUYÊN MÔN: ${chunk.category.toUpperCase()}]\n--- Tài liệu: ${chunk.title} ---\n${chunk.content}`;
  }
  return combinedText;
}

// ============================================================
// SEMANTIC SEARCH — Gemini text-embedding-004
// ============================================================

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Tạo embedding vector cho một đoạn text bằng Gemini text-embedding-004.
 * @param {string} text
 * @param {string} apiKey
 * @param {'RETRIEVAL_DOCUMENT'|'RETRIEVAL_QUERY'} taskType
 * @returns {Promise<number[]>} vector 768 chiều
 */
export async function generateEmbedding(text, apiKey, taskType = "RETRIEVAL_DOCUMENT") {
  const ai = new GoogleGenAI({ apiKey });
  // Giới hạn input — model chấp nhận tối đa ~2048 tokens (~8000 chars)
  const trimmed = text.slice(0, 8000);
  const result = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: trimmed,
    config: { taskType },
  });
  return result.embeddings[0].values;
}

/**
 * Lấy API key đang hoạt động để gọi embedding (ưu tiên pool, fallback env)
 */
async function getActiveGeminiKey() {
  const pool = await loadKeyPool("gemini");
  const fallback = process.env.GEMINI_API_KEY;
  const allKeys = pool.length > 0
    ? [...pool.map(k => k.apiKey), fallback].filter(Boolean)
    : [fallback].filter(Boolean);
  return allKeys.find(k => !isKeyBlacklisted(k)) || null;
}

/**
 * Semantic retrieval: embed câu hỏi → cosine similarity → top N chunks.
 * Fallback về keyword search cho chunk chưa có embedding.
 * @param {string} question
 * @param {object[]} chunks - mảng chunks từ loadKnowledgeBase()
 * @param {number} topN - số chunk trả về (mặc định 5)
 * @returns {Promise<string>} combined knowledge text
 */
export async function retrieveSemanticKnowledge(question, chunks, topN = 5) {
  if (!chunks || chunks.length === 0) return "";

  const chunksWithEmb = chunks.filter(c => c.embeddingVec);
  const chunksNoEmb   = chunks.filter(c => !c.embeddingVec);

  let semanticText = "";

  if (chunksWithEmb.length > 0) {
    try {
      const apiKey = await getActiveGeminiKey();
      if (apiKey) {
        const queryVec = await generateEmbedding(question, apiKey, "RETRIEVAL_QUERY");
        const scored = chunksWithEmb
          .map(c => ({ ...c, score: cosineSimilarity(queryVec, c.embeddingVec) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, topN);
        for (const c of scored) {
          semanticText += `\n\n[CHUYÊN MÔN: ${c.category.toUpperCase()}]\n--- Tài liệu: ${c.title} ---\n${c.content}`;
        }
      }
    } catch (e) {
      console.warn("[Semantic] Lỗi embedding query, fallback keyword:", e.message);
      // Nếu embedding query lỗi → keyword search toàn bộ
      semanticText = retrieveRelevantKnowledge(question, chunksWithEmb);
    }
  }

  // Keyword fallback cho docs chưa có embedding
  const keywordText = chunksNoEmb.length > 0
    ? retrieveRelevantKnowledge(question, chunksNoEmb)
    : "";

  return (semanticText + keywordText).trim();
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "+ ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}

export function clearUserHistory(userId) {
  // Không cần xử lý ở đây vì memory map đã xoá.
  // Ghi chú: Nếu muốn thực sự reset, có thể chèn một tin nhắn "reset" vào DB hoặc xoá history của user đó trong DB
}

// ============================================================
// HÀM CHUNG LẤY THÔNG TIN
// ============================================================
async function prepareAIContext(userId, question) {
  // Lấy toàn bộ thông tin ban đầu song song để tối ưu hóa thời gian xử lý
  const [knowledgeChunks, driveDocuments, settings, follower] = await Promise.all([
    loadKnowledgeBase(),
    loadDriveDocuments(),
    prisma.systemConfig.findMany({ where: { key: { in: ["hotline_main", "address", "ai_custom_prompt", "ai_footer_msg"] } } }),
    prisma.follower.findUnique({ where: { zaloUserId: userId } })
  ]);

  let hotline = "1900988975";
  let address = "118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng";
  let customPrompt = "";
  let footerMsg = "(Địa chỉ: {address} - Hotline: {hotline})"; // Default
  let userProfile = { displayName: "Bạn", role: "CÔNG DÂN", accessLevel: "basic", department: null };

  const h = settings.find(s => s.key === "hotline_main");
  if (h?.value) hotline = h.value;
  const a = settings.find(s => s.key === "address");
  if (a?.value) address = a.value;
  const cp = settings.find(s => s.key === "ai_custom_prompt");
  if (cp?.value) customPrompt = cp.value;
  const fm = settings.find(s => s.key === "ai_footer_msg");
  if (fm) footerMsg = fm.value;
  else footerMsg = `(Địa chỉ: ${address} - Hotline: ${hotline})`;
  
  footerMsg = footerMsg.replace("{address}", address).replace("{hotline}", hotline);
  
  // Lấy thông tin người dùng + cấp độ truy cập
  if (follower) {
    userProfile.displayName = follower.fullName || follower.displayName || "Bạn";
    userProfile.accessLevel = follower.accessLevel || "basic";
    userProfile.department = follower.department || null;
    if (follower.userType === "staff") userProfile.role = "NHÂN VIÊN CỦA CDC (CÁN BỘ NỘI BỘ)";
  }
  
  // Nếu là nhân viên, thử lấy tên thật từ bảng StaffZaloLink
  if (userProfile.role.includes("NHÂN VIÊN")) {
    try {
      const staffLink = await prisma.staffZaloLink.findUnique({ where: { zaloUserId: userId } });
      if (staffLink?.staffNameRaw) {
        userProfile.displayName = staffLink.staffNameRaw;
        if (!userProfile.department && staffLink.department) userProfile.department = staffLink.department;
      }
    } catch (e) {}
  }

  // ============================================================
  // LỌC KHO TRI THỨC THEO PHÒNG BAN ĐƯỢC PHÉP XEM
  // ============================================================
  const userDept = userProfile.department ? userProfile.department.trim().toLowerCase() : null;
  const isStaffUser = userProfile.role.includes("NHÂN VIÊN");
  const isAdminUser = userProfile.accessLevel === "admin" || userProfile.accessLevel === "hr";

  const filteredChunks = knowledgeChunks.filter(chunk => {
    const docDept = chunk.allowedDepartment ? chunk.allowedDepartment.trim().toLowerCase() : "";
    
    // Nếu tài liệu mở cho tất cả phòng ban/mọi đối tượng
    if (!docDept || docDept === "all" || docDept === "tất cả" || docDept === "tất cả cơ quan") {
      return true;
    }
    
    // Nếu tài liệu bị giới hạn phòng ban cụ thể
    if (!isStaffUser) return false; // Người dân không được xem
    if (isAdminUser) return true; // Admin/HR xem được hết
    
    return userDept === docDept; // Nhân viên thường phải khớp phòng ban
  });

  const knowledgeText = retrieveRelevantKnowledge(question, filteredChunks);
  
  // Ghi đè categoryList dựa theo quyền hạn
  let categoryList = "";
  try {
    let customCatConfig = null;
    if (userProfile.role.includes("NHÂN VIÊN")) {
      customCatConfig = await prisma.systemConfig.findUnique({ where: { key: "ai_menu_categories_staff" } });
    }
    if (!customCatConfig || !customCatConfig.value || customCatConfig.value.trim().length === 0) {
      customCatConfig = await prisma.systemConfig.findUnique({ where: { key: "ai_menu_categories" } });
    }
    if (customCatConfig?.value?.trim().length > 0) {
      categoryList = customCatConfig.value.split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean).join(", ");
    }
  } catch (err) {}

  if (!categoryList) {
    const uniqueCategories = [...new Set(filteredChunks.map(c => c.category).filter(Boolean))];
    categoryList = uniqueCategories.length > 0 ? uniqueCategories.join(", ") : "Đang cập nhật dữ liệu";
  }

  const driveSection = driveDocuments.length > 0
    ? `KHO T\u00c0I LI\u1ec6U M\u1eaau (Google Drive):\n` +
      driveDocuments.map((d, i) => `${i + 1}. ${d.name} - Link xem: ${d.link}`).join("\n") +
      `\n\n(Khi nh\u00e2n vi\u00ean y\u00eau c\u1ea7u m\u1eabu t\u00e0i li\u1ec7u, h\u00e3y cung c\u1ea5p t\u00ean file v\u00e0 link x\u00e0 t\u01b0\u01a1ng \u1ee9ng b\u00ean tr\u00ean. Ch\u1ec9 NHÂN VIÊN m\u1edbi \u0111\u01b0\u1ee3c truy c\u1eadp kho t\u00e0i li\u1ec7u n\u00e0y.)`
    : "";

  // ============================================================
  // XÂY DỰNG QUY TẮC BẢO MẬT DỰA THEO CẤP TRUY CẬP
  // ============================================================
  let privacyRule = "";
  if (userProfile.accessLevel === "hr" || userProfile.accessLevel === "admin") {
    // Phòng TCKT / Ban Giám đốc: Xem tất cả mọi người
    privacyRule = `🔓 QUYỀN TRUY CẬP ĐẶC BIỆT (CẤP HR/ADMIN):
Người dùng này thuộc Phòng Tài chính - Kế toán hoặc Ban Giám đốc, được cấp quyền tra cứu thông tin (lương, xếp loại, hệ số, điểm...) của TẤT CẢ nhân viên trong cơ quan.
Bạn ĐƯỢC PHÉP trả lời đầy đủ các câu hỏi về thông tin cá nhân, lương thưởng của bất kỳ nhân viên nào khi được hỏi.`;
  } else if (userProfile.accessLevel === "manager") {
    // Trưởng phòng: Chỉ xem nhân viên cùng đơn vị
    const dept = userProfile.department || "đơn vị của họ";
    privacyRule = `🔓 QUYỀN TRUY CẤP TRƯỞNG ĐƠN VỊ (${dept}):
Người dùng này là Trưởng đơn vị "${dept}", được phép tra cứu thông tin (lương, xếp loại, điểm...) của các nhân viên THUỘC đơn vị "${dept}".
Nếu câu hỏi về nhân viên KHÔNG thuộc đơn vị "${dept}", hãy từ chối lịch sự: "Xin lỗi, tôi chỉ có thể cung cấp thông tin nhân viên trong đơn vị ${dept} của bạn."
Để xác định nhân viên có thuộc đơn vị hay không, hãy dựa vào thông tin phòng ban trong tài liệu chuyên môn.`;
  } else {
    // Nhân viên thường / Người dân: Chỉ xem bản thân
    privacyRule = `🚨 QUY TẮC BẢO MẬT TỐI CAO (BẮT BUỘC TUÂN THỦ):
Nếu người dùng hỏi thông tin cá nhân (lương, thưởng, hệ số, xếp loại, điểm số...) của MỘT NGƯỜI KHÁC (tên không giống với "${userProfile.displayName}"), bạn PHẢI TỪ CHỐI NGAY LẬP TỨC.
Câu trả lời duy nhất được phép là: "Xin lỗi, vì lý do bảo mật dữ liệu nội bộ, tôi chỉ có thể cung cấp thông tin cá nhân cho chính chủ."
Bạn KHÔNG ĐƯỢC PHÉP tiết lộ dữ liệu cá nhân của người khác dưới bất kỳ hình thức nào. Nếu là CÔNG DÂN, chỉ cung cấp thông tin y tế công cộng.`;
  }

  const systemInstruction = `Bạn là Trợ lý AI chính thức của Trung tâm Kiểm soát bệnh tật TP. Đà Nẵng (CDC Đà Nẵng). Vai trò của bạn là hỗ trợ, giải đáp thắc mắc cho người dân và cán bộ của CDC Đà Nẵng.

THÔNG TIN NGƯỜI ĐANG TRÒ CHUYỆN:
- Tên đang trò chuyện: ${userProfile.displayName}
- Phân loại: ${userProfile.role}
- Đơn vị: ${userProfile.department || "Chưa xác định"}
- Cấp truy cập: ${userProfile.accessLevel}

${privacyRule}

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên TÀI LIỆU CHUYÊN MÔN được cung cấp bên dưới. Không tự suy đoán.
2. Nếu câu hỏi KHÔNG liên quan đến y tế, dịch vụ của CDC Đà Nẵng, hãy trả lời: "Xin lỗi, tôi chỉ có thể hỗ trợ các vấn đề liên quan đến y tế và dịch vụ của CDC Đà Nẵng. Để được tư vấn thêm, vui lòng liên hệ CDC qua hotline ${hotline}."
3. Nếu tài liệu KHÔNG CÓ ĐỦ thông tin, hãy nói: "Về vấn đề này, tôi đề nghị bạn liên hệ trực tiếp CDC Đà Nẵng qua hotline ${hotline} hoặc đến địa chỉ ${address} để được giải đáp."
4. Khi tra cứu dữ liệu (điểm số, xếp loại, bảng giá...), PHẢI ĐỌC KỸ TOÀN BỘ TÀI LIỆU. Nếu một người/mục có NHIỀU DÒNG dữ liệu (ví dụ: xếp loại 3 tháng), phải tổng hợp và liệt kê ĐẦY ĐỦ tất cả các kết quả đó, TUYỆT ĐỐI không chỉ trả lời kết quả đầu tiên.
5. Người dùng có thể VIẾT SAI CHÍNH TẢ, viết tắt, hoặc VIẾT KHÔNG DẤU (ví dụ: "vacxin" = "vắc xin", "ho cong luong" = "Hồ Công Lượng"). Hãy tự động suy luận thông minh để tìm đúng dữ liệu tương ứng trong tài liệu.
6. KỸ NĂNG ĐỌC BẢNG: Khi trả lời thông tin từ dạng bảng (như bảng giá, danh sách), hãy trình bày thật chuyên nghiệp, dễ nhìn. Phân ô bằng khoảng trắng hoặc dấu gạch đứng (|), ví dụ: 
+ Vắc xin A: 500.000đ (Ghi chú: ...)
+ Vắc xin B: 400.000đ
KHÔNG viết dính liền thành 1 đoạn văn lộn xộn.
7. TUYỆT ĐỐI không dùng ký tự Markdown in đậm, in nghiêng (*, **, _, __, #, >, ---). KHÔNG dùng ký hiệu toán học.
8. Dùng số thứ tự (1. 2. 3.) hoặc ký tự + để liệt kê thay cho dấu gạch -.
9. Trả lời bằng tiếng Việt thân thiện, dễ hiểu, KHÔNG bao giờ bị cắt cụt.
10. BẠN KHÔNG ĐƯỢC PHÉP tự ý thêm câu "(Địa chỉ: ... Hotline: ...)" vào cuối tin nhắn. Hệ thống sẽ tự động thực hiện việc đó.
11. GIAO TIẾP GỢI Ý: Nếu người dùng gửi lời chào ("chào", "hi") hoặc hỏi bạn biết làm gì, hãy vui vẻ giới thiệu bản thân là Trợ lý AI và gợi ý rằng bạn có thể hỗ trợ các chuyên mục sau: ${categoryList}.

CÁC QUY TẮC BỔ SUNG TỪ ADMIN (ƯU TIÊN CAO):
${customPrompt}

TÀI LIỆU CHUYÊN MÔN:
${knowledgeText || `(Chưa có tài liệu. Vui lòng gọi ${hotline}.)`}

${driveSection}`;

  // Lấy lịch sử 12 tin nhắn gần nhất từ Database
  const recentLogs = await prisma.messageLog.findMany({
    where: { zaloUserId: userId },
    orderBy: { receivedAt: "desc" },
    take: 12,
  });
  recentLogs.reverse(); // Sắp xếp lại theo trình tự thời gian

  const history = [];
  for (let i = 0; i < recentLogs.length; i++) {
    const log = recentLogs[i];
    // Bỏ qua tin nhắn cuối cùng nếu đó là câu hỏi hiện tại (do webhook đã lưu trước khi gọi AI)
    if (i === recentLogs.length - 1 && log.direction === "inbound") break;
    
    if (!log.content || !log.content.trim()) continue;
    const role = log.direction === "inbound" ? "user" : "model";
    
    // Xóa các footer rác trong lịch sử để AI không học theo
    let text = log.content;
    if (role === "model") {
      text = text.replace(/\(Địa chỉ:.*?\)/g, "").trim();
      if (footerMsg && footerMsg.trim() !== "") {
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const footerRegex = new RegExp(escapeRegExp(footerMsg), "g");
        text = text.replace(footerRegex, "").trim();
      }
    }
    
    if (history.length === 0) {
      if (role === "user") history.push({ role, parts: [{ text }] });
    } else {
      if (history[history.length - 1].role !== role) {
        history.push({ role, parts: [{ text }] });
      } else {
        history[history.length - 1].parts[0].text += "\n" + text;
      }
    }
  }

  return { systemInstruction, history, hotline, address, footerMsg };
}

// ============================================================
// HÀM XỬ LÝ CHÍNH
// ============================================================
export async function askAI(userId, question) {
  const now = Date.now();
  if (!cachedProvider || now - providerCacheTime > PROVIDER_CACHE_TTL) {
    try {
      const pc = await prisma.systemConfig.findUnique({ where: { key: "ai_provider" } });
      cachedProvider = pc?.value || "gemini";
      providerCacheTime = now;
    } catch (e) {
      cachedProvider = "gemini";
    }
  }

  if (cachedProvider === "groq") {
    return await askGroq(userId, question);
  } else {
    return await askGemini(userId, question);
  }
}

async function askGemini(userId, question, contextOverride) {
  const pool = await loadKeyPool("gemini");
  const fallbackKey = process.env.GEMINI_API_KEY;
  if (pool.length === 0 && !fallbackKey) {
    // Không có Gemini key → thử Groq ngay
    console.warn("[AI Router] Không có Gemini key, chuyển sang Groq...");
    return await askGroq(userId, question, contextOverride);
  }

  const ctx = contextOverride || await prepareAIContext(userId, question);
  const { systemInstruction, history, hotline, footerMsg } = ctx;
  const contents = [...history, { role: "user", parts: [{ text: question }] }];

  // Xây danh sách key, bỏ qua key đang bị blacklist
  const startIdx = pool.length > 0 ? (geminiCurrentIndex % pool.length) : 0;
  const allKeys = pool.length > 0
    ? [...pool.slice(startIdx).map(k => k.apiKey), ...pool.slice(0, startIdx).map(k => k.apiKey), fallbackKey].filter(Boolean)
    : [fallbackKey].filter(Boolean);
  
  const activeKeys = allKeys.filter(k => !isKeyBlacklisted(k));
  if (pool.length > 0) geminiCurrentIndex = (geminiCurrentIndex + 1) % pool.length;

  // Nếu tất cả key Gemini đang bị blacklist → chuyển sang Groq ngay
  if (activeKeys.length === 0) {
    console.warn("[AI Router] Toàn bộ Gemini key đang bị rate-limit, chuyển sang Groq...");
    try {
      return await askGroq(userId, question, ctx);
    } catch {
      return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
    }
  }

  // Model duy nhất: Gemini 3.1 Flash Lite (15 RPM, 500 RPD/key)
  const geminiModels = [
    "gemini-3.1-flash-lite"
  ];

  let lastError = null;
  for (let i = 0; i < activeKeys.length; i++) {
    const apiKey = activeKeys[i];
    const currentModel = geminiModels[geminiModelIndex % geminiModels.length];
    geminiModelIndex++;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config: { systemInstruction, maxOutputTokens: 2048, temperature: 0.3 }
      });

      // Update tokens
      const usedTokens = response.usageMetadata?.totalTokenCount || 0;
      if (usedTokens > 0) {
        const pool = await loadKeyPool("gemini");
        const keyObj = pool.find(k => k.apiKey === apiKey);
        if (keyObj) {
          prisma.geminiApiKey.update({
            where: { id: keyObj.id },
            data: { usageTokens: { increment: usedTokens }, usageCount: { increment: 1 } }
          }).catch(e => console.error("[Token Update Error]", e));
        }
      }

      let cleanedAnswer = stripMarkdown(response.text || "Xin lỗi, hệ thống bị lỗi.");
      if (footerMsg) cleanedAnswer += "\n\n" + footerMsg;
      return cleanedAnswer;
    } catch (err) {
      lastError = err;
      const errMsg = err.message?.toLowerCase() || "";
      const isRateLimit = errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("quota");
      const isUnavailable = errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand") || errMsg.includes("overloaded");
      const isNotFound = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("model");

      if (isRateLimit) {
        blacklistKey(apiKey); // Chỉ blacklist khi thật sự rate-limit (429)
        continue;
      }
      if (isUnavailable || isNotFound) continue; // Lỗi tạm thời → thử key/model khác, KHÔNG blacklist
      throw err; // Lỗi khác → ném ra ngoài
    }
  }

  // Toàn bộ Gemini key đã thử hết → fallback Groq
  console.warn("[AI Router] Toàn bộ Gemini key thất bại, thử Groq...");
  try {
    return await askGroq(userId, question, ctx);
  } catch {
    return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
  }
}

async function askGroq(userId, question, contextOverride) {
  const pool = await loadKeyPool("groq");
  if (pool.length === 0) throw new Error("Chưa có cấu hình Groq API Key.");

  const ctx = contextOverride || await prepareAIContext(userId, question);
  const { systemInstruction, history, hotline, footerMsg } = ctx;

  const groqMessages = [{ role: "system", content: systemInstruction }];
  for (const h of history) {
    groqMessages.push({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts[0].text
    });
  }
  groqMessages.push({ role: "user", content: question });

  const startIdx = pool.length > 0 ? (groqCurrentIndex % pool.length) : 0;
  const allKeys = [...pool.slice(startIdx).map(k => k.apiKey), ...pool.slice(0, startIdx).map(k => k.apiKey)].filter(Boolean);
  const activeKeys = allKeys.filter(k => !isKeyBlacklisted(k));
  if (pool.length > 0) groqCurrentIndex = (groqCurrentIndex + 1) % pool.length;

  if (activeKeys.length === 0) {
    return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
  }

  let lastError = null;
  for (let i = 0; i < activeKeys.length; i++) {
    const apiKey = activeKeys[i];
    try {
      const groq = new Groq({ apiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: groqMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 2048,
      });

      // Update tokens
      const usedTokens = chatCompletion.usage?.total_tokens || 0;
      if (usedTokens > 0) {
        const pool = await loadKeyPool("groq");
        const keyObj = pool.find(k => k.apiKey === apiKey);
        if (keyObj) {
          prisma.groqApiKey.update({
            where: { id: keyObj.id },
            data: { usageTokens: { increment: usedTokens }, usageCount: { increment: 1 } }
          }).catch(e => console.error("[Token Update Error Groq]", e));
        }
      }

      const rawAnswer = chatCompletion.choices[0]?.message?.content || "Xin lỗi, không có phản hồi từ AI.";
      let cleanedAnswer = stripMarkdown(rawAnswer);
      if (footerMsg) cleanedAnswer += "\n\n" + footerMsg;
      return cleanedAnswer;
    } catch (err) {
      lastError = err;
      if (err.status === 429 || err.status === 503 || err.status === 500) {
        blacklistKey(apiKey);
        continue;
      }
      throw err;
    }
  }
  return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
}

// ============================================================
// HÀM PUBLIC CHAT — Dành cho widget hỏi đáp trên website
// Không cần Zalo session, chỉ truy cập tài liệu public
// ============================================================

/**
 * Trả lời câu hỏi từ người dùng website (không đăng nhập).
 * @param {string} question - Câu hỏi của người dùng
 * @param {{role: "user"|"assistant", content: string}[]} history - Lịch sử hội thoại
 * @returns {Promise<string>} - Câu trả lời của AI
 */
export async function answerPublicQuestion(question, history = []) {
  // Load kho tri thức + cài đặt từ Payload CMS Settings
  const [knowledgeChunks, payloadSettings] = await Promise.all([
    loadKnowledgeBase(),
    (async () => {
      try {
        const { getPayload } = await import("payload");
        const config = await import("@payload-config");
        const payload = await getPayload({ config: config.default });
        return await payload.findGlobal({ slug: "settings", depth: 0 });
      } catch { return null; }
    })()
  ]);

  // Đọc cấu hình AI từ Settings
  const aiChat = payloadSettings?.aiChatSettings || {};
  const hotline   = "1900988975";
  const address   = "118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, TP. Đà Nẵng";
  const customPrompt   = aiChat.chatCustomPrompt || "";
  const welcomeMessage = aiChat.chatWelcomeMessage || "";

  // Parse danh sách API key (mỗi dòng 1 key)
  const keysFromSettings = (aiChat.geminiApiKeys || "")
    .split("\n")
    .map(k => k.trim())
    .filter(k => k.length > 10);

  // Lấy key: ưu tiên Settings → DB pool → env
  const dbPool = await loadKeyPool("gemini");
  const envKey = process.env.GEMINI_API_KEY;
  const allGeminiKeys = [
    ...keysFromSettings,
    ...dbPool.map(k => k.apiKey),
    envKey
  ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i); // unique

  // Chỉ lấy tài liệu công khai (allowedDepartment = null hoặc "all")
  const publicChunks = knowledgeChunks.filter(chunk => {
    const dept = chunk.allowedDepartment ? chunk.allowedDepartment.trim().toLowerCase() : "";
    return !dept || dept === "all" || dept === "tất cả" || dept === "tất cả cơ quan";
  });

  const knowledgeText = await retrieveSemanticKnowledge(question, publicChunks, 5);

  // Danh sách chuyên mục
  const uniqueCats = [...new Set(publicChunks.map(c => c.category).filter(Boolean))];
  const categoryList = uniqueCats.length > 0 ? uniqueCats.join(", ") : "Đang cập nhật dữ liệu";

  const systemInstruction = `Bạn là Trợ lý AI chính thức của Trung tâm Kiểm soát bệnh tật TP. Đà Nẵng (CDC Đà Nẵng). Vai trò của bạn là hỗ trợ, giải đáp thắc mắc cho người dân về các dịch vụ y tế công cộng.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên TÀI LIỆU CHUYÊN MÔN được cung cấp bên dưới. Không tự suy đoán.
2. Nếu câu hỏi KHÔNG liên quan đến y tế, dịch vụ của CDC Đà Nẵng, hãy trả lời: "Xin lỗi, tôi chỉ có thể hỗ trợ các vấn đề liên quan đến y tế và dịch vụ của CDC Đà Nẵng. Để được tư vấn thêm, vui lòng liên hệ CDC qua hotline ${hotline}."
3. Nếu tài liệu KHÔNG CÓ ĐỦ thông tin, hãy nói: "Về vấn đề này, tôi đề nghị bạn liên hệ trực tiếp CDC Đà Nẵng qua hotline ${hotline} hoặc đến địa chỉ ${address} để được giải đáp."
4. Khi tra cứu dữ liệu (bảng giá, lịch tiêm...), PHẢI ĐỌC KỸ TOÀN BỘ TÀI LIỆU và liệt kê ĐẦY ĐỦ.
5. Người dùng có thể VIẾT SAI CHÍNH TẢ, viết tắt, hoặc VIẾT KHÔNG DẤU. Hãy tự động suy luận thông minh.
6. KỸ NĂNG ĐỌC BẢNG: Trình bày thông tin từ bảng dạng dễ nhìn, phân ô rõ ràng.
7. TUYỆT ĐỐI không dùng ký tự Markdown in đậm, in nghiêng (*, **, _, __, #). Dùng số thứ tự hoặc ký tự + để liệt kê.
8. Dùng tiếng Việt thân thiện, dễ hiểu, KHÔNG bao giờ bị cắt cụt.
9. BẠN KHÔNG ĐƯỢC PHÉP tự ý thêm câu "(Địa chỉ: ... Hotline: ...)" vào cuối tin nhắn.
10. GIAO TIẾP GỢI Ý: Nếu người dùng gửi lời chào hoặc hỏi bạn biết làm gì, hãy vui vẻ giới thiệu bản thân là Trợ lý AI của CDC Đà Nẵng và gợi ý các chuyên mục: ${categoryList}.
11. TUYỆT ĐỐI KHÔNG cung cấp thông tin nội bộ (lương, nhân sự, hồ sơ cán bộ). Đây là kênh phục vụ người dân.

CÁC QUY TẮC BỔ SUNG TỪ ADMIN (ƯU TIÊN CAO):
${customPrompt}

TÀI LIỆU CHUYÊN MÔN:
${knowledgeText || `(Chưa có tài liệu phù hợp. Vui lòng gọi ${hotline}.)`}`;

  // Chuẩn bị lịch sử hội thoại cho Gemini format
  const geminiHistory = [];
  for (const msg of history) {
    if (!msg.content?.trim()) continue;
    const role = msg.role === "assistant" ? "model" : "user";
    if (geminiHistory.length === 0 && role !== "user") continue;
    if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === role) {
      geminiHistory[geminiHistory.length - 1].parts[0].text += "\n" + msg.content;
    } else {
      geminiHistory.push({ role, parts: [{ text: msg.content }] });
    }
  }

  const contents = [...geminiHistory, { role: "user", parts: [{ text: question }] }];

  if (allGeminiKeys.length === 0) {
    return `Xin lỗi, hệ thống AI chưa được cấu hình API key. Vui lòng liên hệ CDC qua hotline ${hotline}.`;
  }

  const activeKeys = allGeminiKeys.filter(k => !isKeyBlacklisted(k));
  if (activeKeys.length === 0) {
    return `Hệ thống AI đang bận. Vui lòng thử lại sau ít phút hoặc gọi hotline ${hotline}.`;
  }

  for (const apiKey of activeKeys) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents,
        config: { systemInstruction, maxOutputTokens: 2048, temperature: 0.3 }
      });
      return stripMarkdown(response.text || "Xin lỗi, hệ thống bị lỗi.");
    } catch (err) {
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota")) {
        blacklistKey(apiKey); continue;
      }
      if (msg.includes("503") || msg.includes("404")) continue;
      throw err;
    }
  }
  return `Hệ thống AI đang bận. Vui lòng thử lại sau ít phút hoặc gọi hotline ${hotline}.`;
}

