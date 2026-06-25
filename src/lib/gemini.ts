import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { getPayload } from 'payload';
import configPromise from '@payload-config';

let knowledgeBaseCache: any = null;
let knowledgeCacheTime = 0;
const KNOWLEDGE_CACHE_TTL = 30 * 60 * 1000;

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

async function prepareAIContext(userId: string, question: string, providedHistory: any[] = []) {
  const payload = await getPayload({ config: configPromise });
  const [knowledgeChunks, settingsResult] = await Promise.all([
    loadKnowledgeBase(),
    payload.findGlobal({ slug: "settings", depth: 0 })
  ]);

  const settings = settingsResult as any;
  const aiChat = settings?.aiChatSettings || {};
  
  let hotline = "1900988975";
  let address = "118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng";
  let customPrompt = aiChat.chatCustomPrompt || "";
  let footerMsg = "(Địa chỉ: {address} - Hotline: {hotline})"; // default if not set in settings, but we don't have a field for it yet. Can omit or keep default.

  const knowledgeText = retrieveRelevantKnowledge(question, knowledgeChunks);
  
  let categoryList = "";
  const uniqueCategories = [...new Set(knowledgeChunks.map((c: any) => c.category).filter(Boolean))];
  categoryList = uniqueCategories.length > 0 ? uniqueCategories.join(", ") : "Đang cập nhật dữ liệu";

  const systemInstruction = `Bạn là Trợ lý AI chính thức của Trung tâm Kiểm soát bệnh tật TP. Đà Nẵng (CDC Đà Nẵng). Vai trò của bạn là hỗ trợ, giải đáp thắc mắc cho người dân.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên TÀI LIỆU CHUYÊN MÔN được cung cấp bên dưới. Không tự suy đoán.
2. Nếu câu hỏi KHÔNG liên quan đến y tế, dịch vụ của CDC Đà Nẵng, hãy trả lời: "Xin lỗi, tôi chỉ có thể hỗ trợ các vấn đề liên quan đến y tế và dịch vụ của CDC Đà Nẵng. Để được tư vấn thêm, vui lòng liên hệ CDC qua hotline ${hotline}."
3. Nếu tài liệu KHÔNG CÓ ĐỦ thông tin, hãy nói: "Về vấn đề này, tôi đề nghị bạn liên hệ trực tiếp CDC Đà Nẵng qua hotline ${hotline} hoặc đến địa chỉ ${address} để được giải đáp."
4. Khi tra cứu dữ liệu (điểm số, xếp loại, bảng giá...), PHẢI ĐỌC KỸ TOÀN BỘ TÀI LIỆU. Nếu một người/mục có NHIỀU DÒNG dữ liệu (ví dụ: xếp loại 3 tháng), phải tổng hợp và liệt kê ĐẦY ĐỦ tất cả các kết quả đó, TUYỆT ĐỐI không chỉ trả lời kết quả đầu tiên.
5. Người dùng có thể VIẾT SAI CHÍNH TẢ, viết tắt, hoặc VIẾT KHÔNG DẤU (ví dụ: "vacxin" = "vắc xin"). Hãy tự động suy luận thông minh để tìm đúng dữ liệu tương ứng trong tài liệu.
6. KỸ NĂNG ĐỌC BẢNG: Khi trả lời thông tin từ dạng bảng (như bảng giá, danh sách), hãy trình bày thật chuyên nghiệp, dễ nhìn. Phân ô bằng khoảng trắng hoặc dấu gạch đứng (|), ví dụ: 
+ Vắc xin A: 500.000đ (Ghi chú: ...)
+ Vắc xin B: 400.000đ
KHÔNG viết dính liền thành 1 đoạn văn lộn xộn.
7. TUYỆT ĐỐI không dùng ký tự Markdown in đậm, in nghiêng (*, **, _, __, #, >, ---). KHÔNG dùng ký hiệu toán học.
8. Dùng số thứ tự (1. 2. 3.) hoặc ký tự + để liệt kê thay cho dấu gạch -.
9. Trả lời bằng tiếng Việt thân thiện, dễ hiểu, KHÔNG bao giờ bị cắt cụt.
10. GIAO TIẾP GỢI Ý: Nếu người dùng gửi lời chào ("chào", "hi") hoặc hỏi bạn biết làm gì, hãy vui vẻ giới thiệu bản thân là Trợ lý AI và gợi ý rằng bạn có thể hỗ trợ các chuyên mục sau: ${categoryList}.

CÁC QUY TẮC BỔ SUNG TỪ ADMIN (ƯU TIÊN CAO):
${customPrompt}

TÀI LIỆU CHUYÊN MÔN:
${knowledgeText || `(Chưa có tài liệu. Vui lòng gọi ${hotline}.)`}`;

  // Build history format compatible with Gemini API
  const history: any[] = [];
  for (const msg of providedHistory) {
     if (msg.role === "user") {
        history.push({ role: "user", parts: [{ text: msg.content }] });
     } else if (msg.role === "assistant") {
        let text = msg.content;
        text = text.replace(/\(Địa chỉ:.*?\)/g, "").trim(); // clean up footer if any
        history.push({ role: "model", parts: [{ text }] });
     }
  }

  return { systemInstruction, history, hotline, address, footerMsg: null }; // Removed auto-footer to make chat cleaner
}

export async function askAI(userId: string, question: string, history: any[] = []) {
  const now = Date.now();
  if (!cachedProvider || now - providerCacheTime > PROVIDER_CACHE_TTL) {
     // Check if we still have a provider setting. We don't have it in Settings global right now, 
     // so we default to gemini.
     cachedProvider = "gemini";
     providerCacheTime = now;
  }

  if (cachedProvider === "groq") {
    return await askGroq(userId, question, history);
  } else {
    return await askGemini(userId, question, history);
  }
}

async function askGemini(userId: string, question: string, providedHistory: any[] = [], contextOverride?: any) {
  const pool = await loadKeyPool("gemini");
  const fallbackKey = process.env.GEMINI_API_KEY;
  if (pool.length === 0 && !fallbackKey) {
    console.warn("[AI Router] Không có Gemini key, chuyển sang Groq...");
    return await askGroq(userId, question, providedHistory, contextOverride);
  }

  const ctx = contextOverride || await prepareAIContext(userId, question, providedHistory);
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
      return await askGroq(userId, question, providedHistory, ctx);
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
    return await askGroq(userId, question, providedHistory, ctx);
  } catch {
    return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau vài phút hoặc gọi hotline ${hotline}.`;
  }
}

async function askGroq(userId: string, question: string, providedHistory: any[] = [], contextOverride?: any) {
  const pool = await loadKeyPool("groq");
  if (pool.length === 0) throw new Error("Chưa có cấu hình Groq API Key.");

  const ctx = contextOverride || await prepareAIContext(userId, question, providedHistory);
  const { systemInstruction, hotline, footerMsg } = ctx;

  const groqMessages: any[] = [{ role: "system", content: systemInstruction }];
  for (const h of providedHistory) {
    groqMessages.push({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content
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
