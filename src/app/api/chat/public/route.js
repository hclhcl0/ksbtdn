import { NextResponse } from "next/server";
import { askAI } from "@/lib/gemini";

// ============================================================
// GET /api/chat/public - Lấy cấu hình bật/tắt & tin nhắn chào mừng
// ============================================================
export async function GET(request) {
  try {
    const { getPayload } = await import("payload");
    const config = await import("@payload-config");
    const payload = await getPayload({ config: config.default });
    const payloadSettings = await payload.findGlobal({ slug: "settings", depth: 0 });
    const aiChat = payloadSettings?.aiChatSettings;
    
    return NextResponse.json({
      success: true,
      enabled: aiChat?.chatEnabled !== false, // Mặc định là true nếu chưa lưu cấu hình
      welcomeMessage: aiChat?.chatWelcomeMessage || "Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?",
    });
  } catch (error) {
    console.error("[GET /api/chat/public] Error:", error);
    return NextResponse.json(
      { success: false, error: "Hệ thống đang gặp sự cố." },
      { status: 500 }
    );
  }
}

// ============================================================
// Rate Limiting đơn giản theo IP (in-memory)
// ============================================================
const rateMap = new Map(); // IP -> { count, resetAt }
const RATE_LIMIT = 10;     // tối đa 10 requests
const RATE_WINDOW = 60_000; // trong 60 giây

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Cleanup cũ mỗi 5 phút để tránh memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap.entries()) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, 5 * 60_000);

// ============================================================
// POST /api/chat/public
// Body: { question: string, history: [{role, content}][] }
// ============================================================
export async function POST(request) {
  try {
    // Lấy IP để rate limit
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Bạn đang gửi quá nhiều câu hỏi. Vui lòng chờ một phút rồi thử lại." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const question = (body.question || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập câu hỏi." },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Câu hỏi quá dài. Vui lòng rút ngắn lại." },
        { status: 400 }
      );
    }

    // Giới hạn lịch sử: chỉ giữ 10 tin nhắn gần nhất
    const trimmedHistory = history.slice(-10).filter(
      (m) => m && typeof m.role === "string" && typeof m.content === "string"
    );

    const answer = await askAI("public_" + ip, question);

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("[POST /api/chat/public] Error:", error);
    return NextResponse.json(
      { success: false, error: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
