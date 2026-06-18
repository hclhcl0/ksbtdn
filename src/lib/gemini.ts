import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { getPayload } from 'payload';
import configPromise from '@payload-config';

let knowledgeBaseCache: any = null;
let knowledgeCacheTime = 0;
const KNOWLEDGE_CACHE_TTL = 30 * 60 * 1000;

let driveDocCache: any = null;
let driveDocCacheTime = 0;
const DRIVE_CACHE_TTL = 10 * 60 * 1000;

async function getConfigValue(key: string): Promise<string | null> {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'zalo-system-configs',
    where: { key: { equals: key } },
    limit: 1,
  });
  return result.docs.length > 0 ? result.docs[0].value : null;
}

export async function loadDriveDocuments() {
  const now = Date.now();
  if (driveDocCache !== null && (now - driveDocCacheTime < DRIVE_CACHE_TTL)) {
    return driveDocCache;
  }
  try {
    const payload = await getPayload({ config: configPromise });
    const configs = await payload.find({
      collection: 'zalo-system-configs',
      where: { key: { in: ["drive_folder_id", "google_api_key", "drive_refresh_token", "gmail_oauth_client_id", "gmail_oauth_client_secret"] } },
      limit: 10
    });
    
    const getConfig = (k: string) => configs.docs.find((c: any) => c.key === k)?.value;
    
    const folderId = getConfig("drive_folder_id");
    const apiKey = getConfig("google_api_key");
    const refreshToken = getConfig("drive_refresh_token");
    const clientId = getConfig("gmail_oauth_client_id");
    const clientSecret = getConfig("gmail_oauth_client_secret");

    if (!folderId) { driveDocCache = []; driveDocCacheTime = now; return []; }

    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const fields = encodeURIComponent("files(id,name,mimeType)");
    let headers: any = {};
    let url;

    if (apiKey) {
      url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&key=${apiKey}`;
    } else if (refreshToken && clientId && clientSecret) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        driveDocCache = []; driveDocCacheTime = now; return [];
      }
      url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100`;
      headers = { Authorization: `Bearer ${tokenData.access_token}` };
    } else {
      driveDocCache = []; driveDocCacheTime = now; return [];
    }

    const res = await fetch(url, { headers });
    const json = await res.json();
    if (!res.ok || !json.files) {
      driveDocCache = []; driveDocCacheTime = now; return [];
    }

    driveDocCache = json.files.map((f: any) => ({
      name: f.name,
      link: `https://drive.google.com/file/d/${f.id}/view`,
      download: `https://drive.google.com/uc?export=download&id=${f.id}`,
    }));
    driveDocCacheTime = now;
    return driveDocCache;
  } catch (e: any) {
    console.error("[Drive] Exception:", e.message);
    driveDocCache = [];
    driveDocCacheTime = now;
    return [];
  }
}

let cachedProvider: string | null = null;
let providerCacheTime = 0;
const PROVIDER_CACHE_TTL = 60 * 1000;

const keyBlacklist = new Map();
const BLACKLIST_TTL = 2 * 60 * 1000;

function isKeyBlacklisted(apiKey: string) {
  const exp = keyBlacklist.get(apiKey);
  if (!exp) return false;
  if (Date.now() > exp) { keyBlacklist.delete(apiKey); return false; }
  return true;
}

function blacklistKey(apiKey: string) {
  keyBlacklist.set(apiKey, Date.now() + BLACKLIST_TTL);
}

let geminiKeyPool: any[] = [];
let geminiKeyPoolTime = 0;
let geminiCurrentIndex = 0;
let geminiModelIndex = 0;

let groqKeyPool: any[] = [];
let groqKeyPoolTime = 0;
let groqCurrentIndex = 0;

const API_KEY_CACHE_TTL = 5 * 60 * 1000;

async function loadKeyPool(provider: string) {
  const now = Date.now();
  const payload = await getPayload({ config: configPromise });
  if (provider === "gemini") {
    if (geminiKeyPool.length > 0 && (now - geminiKeyPoolTime < API_KEY_CACHE_TTL)) return geminiKeyPool;
    try {
      const res = await payload.find({ collection: 'api-keys', where: { provider: { equals: 'gemini' }, isActive: { equals: true } }, limit: 100 });
      geminiKeyPool = res.docs;
      geminiKeyPoolTime = now;
    } catch (e) {}
    return geminiKeyPool;
  } else {
    if (groqKeyPool.length > 0 && (now - groqKeyPoolTime < API_KEY_CACHE_TTL)) return groqKeyPool;
    try {
      const res = await payload.find({ collection: 'api-keys', where: { provider: { equals: 'groq' }, isActive: { equals: true } }, limit: 100 });
      groqKeyPool = res.docs;
      groqKeyPoolTime = now;
    } catch (e) {}
    return groqKeyPool;
  }
}

export function clearApiKeyCache() {
  geminiKeyPool = []; geminiKeyPoolTime = 0; geminiCurrentIndex = 0; geminiModelIndex = 0;
}

export function clearGroqKeyCache() {
  groqKeyPool = []; groqKeyPoolTime = 0; groqCurrentIndex = 0;
}

export async function loadKnowledgeBase() {
  const now = Date.now();
  if (knowledgeBaseCache && (now - knowledgeCacheTime < KNOWLEDGE_CACHE_TTL)) return knowledgeBaseCache;

  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({ collection: 'ai-knowledge', limit: 1000, sort: '-createdAt' });
    const docs = res.docs;
    if (docs.length === 0) {
      knowledgeBaseCache = []; knowledgeCacheTime = now; return [];
    }
    
    let chunks = [];
    for (const doc of docs) {
      chunks.push({
        title: doc.title,
        category: doc.category,
        content: doc.content,
        allowedDepartment: doc.allowedDepartment || null,
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
  knowledgeBaseCache = null; knowledgeCacheTime = 0;
}

function removeVietnameseTones(str: string) {
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

function retrieveRelevantKnowledge(question: string, chunks: any[]) {
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
    combinedText += `\n\n[CHUYÊN MÔN: ${chunk.category?.toUpperCase()}]\n--- Tài liệu: ${chunk.title} ---\n${chunk.content}`;
  }
  
  return combinedText;
}

function stripMarkdown(text: string) {
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

export function clearUserHistory(userId: string) {}

async function prepareAIContext(userId: string, question: string) {
  const payload = await getPayload({ config: configPromise });
  const [knowledgeChunks, driveDocuments, configsResult, followerResult] = await Promise.all([
    loadKnowledgeBase(),
    loadDriveDocuments(),
    payload.find({ collection: 'zalo-system-configs', where: { key: { in: ["hotline_main", "address", "ai_custom_prompt", "ai_footer_msg"] } }, limit: 10 }),
    payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 })
  ]);

  const settings = configsResult.docs;
  const follower = followerResult.docs.length > 0 ? followerResult.docs[0] : null;

  let hotline = "1900988975";
  let address = "118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng";
  let customPrompt = "";
  let footerMsg = "(Địa chỉ: {address} - Hotline: {hotline})";
  let userProfile = { displayName: "Bạn", role: "CÔNG DÂN", accessLevel: "basic", department: null as string | null };

  const h = settings.find((s: any) => s.key === "hotline_main");
  if (h?.value) hotline = h.value;
  const a = settings.find((s: any) => s.key === "address");
  if (a?.value) address = a.value;
  const cp = settings.find((s: any) => s.key === "ai_custom_prompt");
  if (cp?.value) customPrompt = cp.value;
  const fm = settings.find((s: any) => s.key === "ai_footer_msg");
  if (fm) footerMsg = fm.value;
  else footerMsg = `(Địa chỉ: ${address} - Hotline: ${hotline})`;
  
  footerMsg = footerMsg.replace("{address}", address).replace("{hotline}", hotline);
  
  if (follower) {
    userProfile.displayName = follower.displayName || "Bạn";
    userProfile.accessLevel = follower.accessLevel || "basic";
    userProfile.department = follower.department || null;
    if (follower.userType === "staff") userProfile.role = "NHÂN VIÊN CỦA CDC (CÁN BỘ NỘI BỘ)";
  }
  
  if (userProfile.role.includes("NHÂN VIÊN")) {
    try {
      const staffLinkRes = await payload.find({ collection: 'zalo-staff-links', where: { zaloUserId: { equals: userId } }, limit: 1 });
      if (staffLinkRes.docs.length > 0) {
        const staffLink = staffLinkRes.docs[0];
        if (staffLink.staffNameRaw) {
          userProfile.displayName = staffLink.staffNameRaw;
          if (!userProfile.department && staffLink.department) userProfile.department = staffLink.department;
        }
      }
    } catch (e) {}
  }

  const userDept = userProfile.department ? userProfile.department.trim().toLowerCase() : null;
  const isStaffUser = userProfile.role.includes("NHÂN VIÊN");
  const isAdminUser = userProfile.accessLevel === "admin" || userProfile.accessLevel === "hr";

  const filteredChunks = knowledgeChunks.filter((chunk: any) => {
    const docDept = chunk.allowedDepartment ? chunk.allowedDepartment.trim().toLowerCase() : "";
    if (!docDept || docDept === "all" || docDept === "tất cả" || docDept === "tất cả cơ quan") return true;
    if (!isStaffUser) return false;
    if (isAdminUser) return true;
    return userDept === docDept;
  });

  const knowledgeText = retrieveRelevantKnowledge(question, filteredChunks);
  
  let categoryList = "";
  try {
    let customCatConfig: any = null;
    if (userProfile.role.includes("NHÂN VIÊN")) {
      const res = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "ai_menu_categories_staff" } }, limit: 1 });
      if (res.docs.length > 0) customCatConfig = res.docs[0];
    }
    if (!customCatConfig || !customCatConfig.value || customCatConfig.value.trim().length === 0) {
      const res = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "ai_menu_categories" } }, limit: 1 });
      if (res.docs.length > 0) customCatConfig = res.docs[0];
    }
    if (customCatConfig?.value?.trim().length > 0) {
      categoryList = customCatConfig.value.split('\n').map((l: string) => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean).join(", ");
    }
  } catch (err) {}

  if (!categoryList) {
    const uniqueCategories = [...new Set(filteredChunks.map((c: any) => c.category).filter(Boolean))];
    categoryList = uniqueCategories.length > 0 ? uniqueCategories.join(", ") : "Đang cập nhật dữ liệu";
  }

  const driveSection = driveDocuments.length > 0
    ? `KHO TÀI LIỆU MẪU (Google Drive):\n` +
      driveDocuments.map((d: any, i: number) => `${i + 1}. ${d.name} - Link xem: ${d.link}`).join("\n") +
      `\n\n(Khi nhân viên yêu cầu mẫu tài liệu, hãy cung cấp tên file và link tương ứng bên trên. Chỉ NHÂN VIÊN mới được truy cập kho tài liệu này.)`
    : "";

  let privacyRule = "";
  if (userProfile.accessLevel === "hr" || userProfile.accessLevel === "admin") {
    privacyRule = `🔓 QUYỀN TRUY CẬP ĐẶC BIỆT (CẤP HR/ADMIN):
Người dùng này thuộc Phòng Tài chính - Kế toán hoặc Ban Giám đốc, được cấp quyền tra cứu thông tin (lương, xếp loại, hệ số, điểm...) của TẤT CẢ nhân viên trong cơ quan.
Bạn ĐƯỢC PHÉP trả lời đầy đủ các câu hỏi về thông tin cá nhân, lương thưởng của bất kỳ nhân viên nào khi được hỏi.`;
  } else if (userProfile.accessLevel === "manager") {
    const dept = userProfile.department || "đơn vị của họ";
    privacyRule = `🔓 QUYỀN TRUY CẤP TRƯỞNG ĐƠN VỊ (${dept}):
Người dùng này là Trưởng đơn vị "${dept}", được phép tra cứu thông tin (lương, xếp loại, điểm...) của các nhân viên THUỘC đơn vị "${dept}".
Nếu câu hỏi về nhân viên KHÔNG thuộc đơn vị "${dept}", hãy từ chối lịch sự: "Xin lỗi, tôi chỉ có thể cung cấp thông tin nhân viên trong đơn vị ${dept} của bạn."`;
  } else {
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

  const recentLogsRes = await payload.find({
    collection: 'zalo-message-logs',
    where: { zaloUserId: { equals: userId } },
    sort: '-receivedAt',
    limit: 12,
  });
  const recentLogs = recentLogsRes.docs;
  recentLogs.reverse();

  const history: any[] = [];
  for (let i = 0; i < recentLogs.length; i++) {
    const log = recentLogs[i];
    if (i === recentLogs.length - 1 && log.direction === "inbound") break;
    
    if (!log.content || !log.content.trim()) continue;
    const role = log.direction === "inbound" ? "user" : "model";
    
    let text = log.content;
    if (role === "model") {
      text = text.replace(/\(Địa chỉ:.*?\)/g, "").trim();
      if (footerMsg && footerMsg.trim() !== "") {
        const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

export async function askAI(userId: string, question: string) {
  const now = Date.now();
  if (!cachedProvider || now - providerCacheTime > PROVIDER_CACHE_TTL) {
    try {
      const payload = await getPayload({ config: configPromise });
      const res = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "ai_provider" } }, limit: 1 });
      cachedProvider = res.docs.length > 0 ? res.docs[0].value : "gemini";
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

async function askGemini(userId: string, question: string, contextOverride?: any) {
  const pool = await loadKeyPool("gemini");
  const fallbackKey = process.env.GEMINI_API_KEY;
  if (pool.length === 0 && !fallbackKey) {
    console.warn("[AI Router] Không có Gemini key, chuyển sang Groq...");
    return await askGroq(userId, question, contextOverride);
  }

  const ctx = contextOverride || await prepareAIContext(userId, question);
  const { systemInstruction, history, hotline, footerMsg } = ctx;
  const contents = [...history, { role: "user", parts: [{ text: question }] }];

  const startIdx = pool.length > 0 ? (geminiCurrentIndex % pool.length) : 0;
  const allKeys = pool.length > 0
    ? [...pool.slice(startIdx).map(k => k.apiKey), ...pool.slice(0, startIdx).map(k => k.apiKey), fallbackKey].filter(Boolean)
    : [fallbackKey].filter(Boolean);
  
  const activeKeys = allKeys.filter(k => !isKeyBlacklisted(k));
  if (pool.length > 0) geminiCurrentIndex = (geminiCurrentIndex + 1) % pool.length;

  if (activeKeys.length === 0) {
    console.warn("[AI Router] Toàn bộ Gemini key đang bị rate-limit, chuyển sang Groq...");
    try {
      return await askGroq(userId, question, ctx);
    } catch {
      return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
    }
  }

  const geminiModels = ["gemini-2.5-flash"];
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

      const usedTokens = response.usageMetadata?.totalTokenCount || 0;
      if (usedTokens > 0) {
        const currentPool = await loadKeyPool("gemini");
        const keyObj = currentPool.find(k => k.apiKey === apiKey);
        if (keyObj) {
          const payload = await getPayload({ config: configPromise });
          payload.update({
            collection: 'api-keys',
            id: keyObj.id,
            data: { usageTokens: (keyObj.usageTokens || 0) + usedTokens, usageCount: (keyObj.usageCount || 0) + 1 }
          }).catch(e => console.error("[Token Update Error]", e));
        }
      }

      let cleanedAnswer = stripMarkdown(response.text || "Xin lỗi, hệ thống bị lỗi.");
      if (footerMsg) cleanedAnswer += "\n\n" + footerMsg;
      return cleanedAnswer;
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message?.toLowerCase() || "";
      const isRateLimit = errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("quota");
      const isUnavailable = errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand") || errMsg.includes("overloaded");
      const isNotFound = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("model");

      if (isRateLimit) { blacklistKey(apiKey); continue; }
      if (isUnavailable || isNotFound) continue;
      throw err;
    }
  }

  console.warn("[AI Router] Toàn bộ Gemini key thất bại, thử Groq...");
  try {
    return await askGroq(userId, question, ctx);
  } catch {
    return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
  }
}

async function askGroq(userId: string, question: string, contextOverride?: any) {
  const pool = await loadKeyPool("groq");
  if (pool.length === 0) throw new Error("Chưa có cấu hình Groq API Key.");

  const ctx = contextOverride || await prepareAIContext(userId, question);
  const { systemInstruction, history, hotline, footerMsg } = ctx;

  const groqMessages: any[] = [{ role: "system", content: systemInstruction }];
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

      const usedTokens = chatCompletion.usage?.total_tokens || 0;
      if (usedTokens > 0) {
        const currentPool = await loadKeyPool("groq");
        const keyObj = currentPool.find(k => k.apiKey === apiKey);
        if (keyObj) {
          const payload = await getPayload({ config: configPromise });
          payload.update({
            collection: 'api-keys',
            id: keyObj.id,
            data: { usageTokens: (keyObj.usageTokens || 0) + usedTokens, usageCount: (keyObj.usageCount || 0) + 1 }
          }).catch(e => console.error("[Token Update Error Groq]", e));
        }
      }

      const rawAnswer = chatCompletion.choices[0]?.message?.content || "Xin lỗi, không có phản hồi từ AI.";
      let cleanedAnswer = stripMarkdown(rawAnswer);
      if (footerMsg) cleanedAnswer += "\n\n" + footerMsg;
      return cleanedAnswer;
    } catch (err: any) {
      lastError = err;
      if (err.status === 429 || err.status === 503 || err.status === 500) { blacklistKey(apiKey); continue; }
      throw err;
    }
  }
  return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
}
