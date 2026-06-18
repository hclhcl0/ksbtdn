import { NextResponse } from "next/server";
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sendTextMessage } from "@/lib/zalo";
import { askAI, clearUserHistory } from "@/lib/gemini";
// Removed after since it's experimental, or we can use standard promise execution
// import { after } from "next/server"; // next 15+ feature

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("challenge");

  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: "Zalo AI Webhook is running" });
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch (e: any) {
    console.warn("[ZALO WEBHOOK] Body không hợp lệ:", e.message);
  }

  const event_name = body.event_name;
  const message = body.message;
  const timestamp = body.timestamp;
  const senderId = body.sender?.id || body.user_id_by_app || body.follower?.id;

  // Next.js 'after' is experimental or Next 15, let's use standard non-blocking Promise
  const processWebhook = async () => {
    try {
      const payload = await getPayload({ config: configPromise });
      
      // Lưu log vào DB
      await payload.create({
        collection: 'zalo-message-logs',
        data: {
          zaloUserId: senderId || "unknown",
          direction: "inbound",
          type: event_name || "unknown",
          content: message?.text || null,
          rawPayload: JSON.stringify(body),
          receivedAt: timestamp ? new Date(parseInt(timestamp)).toISOString() : new Date().toISOString(),
        },
      });

      if (event_name) {
        switch (event_name) {
          case "user_send_text":
            await handleTextMessage(senderId, message?.text, payload);
            break;
          case "follow":
            await handleFollow(senderId, body, payload);
            break;
          case "unfollow":
            await handleUnfollow(senderId, payload);
            break;
          default:
            console.log(`[ZALO WEBHOOK] Unhandled event: ${event_name}`);
        }
      }
    } catch (err: any) {
      console.error("[ZALO WEBHOOK PROCESS ERROR]", err.message);
    }
  };

  // Run in background
  processWebhook().catch(console.error);

  return NextResponse.json({ error: 0, status: "received" });
}

async function handleTextMessage(userId: string, text: string, payload: any) {
  if (!userId || !text) return;
  const trimmedText = text.trim();
  if (!trimmedText) return;

  try {
    const { getUserProfile } = await import("@/lib/zalo");
    const profile = await getUserProfile(userId);
    if (profile?.data) {
      const existing = await payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 });
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'zalo-followers',
          id: existing.docs[0].id,
          data: {
            displayName: profile.data.display_name,
            avatarUrl: profile.data.avatar,
          }
        });
      } else {
        await payload.create({
          collection: 'zalo-followers',
          data: {
            zaloUserId: userId,
            displayName: profile.data.display_name || "Người dùng Zalo",
            avatarUrl: profile.data.avatar || "",
            userType: "citizen",
            accessLevel: "basic"
          }
        });
      }
    }
  } catch (e: any) {
    console.error("[ZALO WEBHOOK] Lỗi cập nhật profile:", e.message);
  }

  const lowerText = trimmedText.toLowerCase();

  if (lowerText === "reset" || lowerText === "bắt đầu lại" || lowerText === "bắt đầu") {
    clearUserHistory(userId);
    let displayName = "bạn";
    try {
      const existing = await payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 });
      if (existing.docs.length > 0 && existing.docs[0].displayName) {
        displayName = existing.docs[0].displayName;
      }
    } catch (e) {}

    let welcomeMsg = "";
    try {
      const welcomeConfig = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "oa_welcome_msg" } }, limit: 1 });
      if (welcomeConfig.docs.length > 0 && welcomeConfig.docs[0].value) {
        welcomeMsg = welcomeConfig.docs[0].value.replace(/{displayName}/g, displayName).replace(/{name}/g, displayName);
      }
    } catch (dbErr) {}

    if (!welcomeMsg) {
      welcomeMsg = `Xin chào ${displayName}! Cảm ơn bạn đã quan tâm CDC Đà Nẵng.\n\nVui lòng nhắn tin để hỏi đáp với AI trợ lý.`;
    }

    await sendTextMessage(userId, welcomeMsg);
    return;
  }

  const staffKeywords = ["tôi là nhân viên", "toi la nhan vien", "nhân viên cdc", "nhan vien cdc", "đăng ký nhân viên", "dang ky nhan vien"];
  if (staffKeywords.some(kw => lowerText.includes(kw))) {
    const registerLink = `https://sender.ksbtdanang.vn/register?uid=${userId}`;
    const replyMsg = `Chào bạn, để Trợ lý AI nhận diện bạn là Cán bộ/Nhân viên của Trung tâm Kiểm soát Bệnh tật TP. Đà Nẵng và cấp quyền tra cứu thông tin nội bộ, vui lòng truy cập đường link dưới đây để liên kết tài khoản:\n\n🔗 ${registerLink}\n\n(Lưu ý: Link này chỉ dành riêng cho tài khoản Zalo của bạn, vui lòng không chia sẻ cho người khác)`;
    await sendTextMessage(userId, replyMsg);
    try {
      await payload.create({
        collection: 'zalo-message-logs',
        data: { zaloUserId: userId, direction: "outbound", type: "text", content: replyMsg, rawPayload: JSON.stringify({ source: "staff_register" }), receivedAt: new Date().toISOString() }
      });
    } catch(e) {}
    return;
  }

  if (["menu", "hd", "hướng dẫn", "chủ đề", "help"].includes(lowerText)) {
    try {
      const followerRes = await payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 });
      const isStaff = followerRes.docs.length > 0 && followerRes.docs[0].userType === "staff";
      
      let customCat: any = null;
      if (isStaff) {
        const res = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "ai_menu_categories_staff" } }, limit: 1 });
        if (res.docs.length > 0) customCat = res.docs[0];
      }
      if (!customCat || !customCat.value || customCat.value.trim().length === 0) {
        const res = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "ai_menu_categories" } }, limit: 1 });
        if (res.docs.length > 0) customCat = res.docs[0];
      }

      let menuText = "📚 DANH MỤC HỖ TRỢ CỦA AI\n\nBạn có thể đặt câu hỏi về các chủ đề sau:\n";
      
      if (customCat && customCat.value && customCat.value.trim().length > 0) {
        menuText += customCat.value + "\n";
      } else {
        const categories = await payload.find({ collection: 'ai-knowledge', limit: 1000 });
        const catList = [...new Set(categories.docs.map((c: any) => c.category).filter(Boolean))];
        if (catList.length === 0) {
          menuText += "(Hệ thống đang cập nhật dữ liệu...)\n";
        } else {
          catList.forEach((cat, index) => {
            menuText += `${index + 1}. ${cat}\n`;
          });
        }
      }
      menuText += "\n💡 Bạn chỉ cần nhắn tin (ví dụ: 'Giá vắc xin dại là bao nhiêu?'), AI sẽ lập tức kiểm tra và phản hồi.";
      await sendTextMessage(userId, menuText);
      return;
    } catch (e: any) {
      console.error("[ZALO WEBHOOK] Lỗi lấy menu chủ đề:", e.message);
    }
  }

  const followerRes = await payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 });
  const isStaff = followerRes.docs.length > 0 && followerRes.docs[0].userType === "staff";
  
  const driveKeywords = ["báo cáo", "bao cao", "biểu mẫu", "bieu mau", "mẫu báo cáo", "tải file", "tai file", "tải về", "tai ve", "form", "mẫu", "mau ", "file ", "tải mẫu", "tai mau", "bc tuần", "bc tuan"];
  const isDriveRequest = isStaff && driveKeywords.some(kw => lowerText.includes(kw));
  
  if (isDriveRequest) {
    try {
      const { loadDriveDocuments } = await import("@/lib/gemini");
      const driveFiles = await loadDriveDocuments();
      if (driveFiles.length > 0) {
        const normalizedQ = lowerText.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,"a").replace(/[èéẹẻẽêềếệểễ]/g,"e").replace(/[ìíịỉĩ]/g,"i").replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,"o").replace(/[ùúụủũưừứựửữ]/g,"u").replace(/[ỳýỵỷỹ]/g,"y").replace(/đ/g,"d");
        
        const scored = driveFiles.map((f: any) => {
          const normalizedName = f.name.toLowerCase().replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,"a").replace(/[èéẹẻẽêềếệểễ]/g,"e").replace(/[ìíịỉĩ]/g,"i").replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,"o").replace(/[ùúụủũưừứựửữ]/g,"u").replace(/[ỳýỵỷỹ]/g,"y").replace(/đ/g,"d");
          const qWords = normalizedQ.split(/\s+/).filter(w => w.length > 1);
          const score = qWords.filter(w => normalizedName.includes(w)).length;
          return { ...f, score };
        }).filter((f: any) => f.score > 0).sort((a: any, b: any) => b.score - a.score);

        if (scored.length > 0) {
          const top = scored[0];
          const follower = followerRes.docs[0];
          const name = follower?.displayName || "bạn";
          const reply = `Chào ${name}, đây là tài liệu "${top.name}" mà bạn yêu cầu:\n\nTên tài liệu: ${top.name}\nLink truy cập: ${top.link}`;
          await sendTextMessage(userId, reply);
          
          try {
            await payload.create({ collection: 'zalo-message-logs', data: { zaloUserId: userId, direction: "outbound", type: "text", content: reply, rawPayload: JSON.stringify({ source: "drive_direct" }), receivedAt: new Date().toISOString() } });
          } catch(e) {}
          return;
        }

        if (scored.length === 0 && lowerText.includes("biểu mẫu") || lowerText.includes("danh sách")) {
          let list = "📂 Danh sách tài liệu/biểu mẫu hiện có:\n\n";
          driveFiles.forEach((f: any, i: number) => { list += `${i + 1}. ${f.name}\n   Link: ${f.link}\n`; });
          await sendTextMessage(userId, list);
          try {
            await payload.create({ collection: 'zalo-message-logs', data: { zaloUserId: userId, direction: "outbound", type: "text", content: list, rawPayload: JSON.stringify({ source: "drive_list" }), receivedAt: new Date().toISOString() } });
          } catch(e) {}
          return;
        }
      }
    } catch (e: any) {
      console.error("[Drive Fast Search] Lỗi:", e.message);
    }
  }

  try {
    const limitConfigRes = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "ai_daily_limit" } }, limit: 1 });
    if (limitConfigRes.docs.length > 0 && limitConfigRes.docs[0].value) {
      const dailyLimit = parseInt(limitConfigRes.docs[0].value, 10);
      if (!isNaN(dailyLimit) && dailyLimit > 0) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const countRes = await payload.find({
          collection: 'zalo-message-logs',
          where: {
            zaloUserId: { equals: userId },
            direction: { equals: "inbound" },
            receivedAt: { greater_than_equal: startOfDay.toISOString() },
          },
        });

        if (countRes.totalDocs > dailyLimit) {
          const rejectMsg = `Bạn đã hết lượt hỏi đáp AI miễn phí trong hôm nay (giới hạn ${dailyLimit} câu/ngày). Vui lòng quay lại vào ngày mai để tiếp tục nhé!`;
          await sendTextMessage(userId, rejectMsg);
          
          try {
            await payload.create({
              collection: 'zalo-message-logs',
              data: {
                zaloUserId: userId, direction: "outbound", type: "text", content: rejectMsg, rawPayload: JSON.stringify({ source: "system_quota" }), receivedAt: new Date().toISOString()
              }
            });
          } catch(e) {}
          return;
        }
      }
    }

    console.log(`[AI] Xử lý câu hỏi từ ${userId}: "${trimmedText.substring(0, 100)}"`);
    const aiReply = await askAI(userId, trimmedText);
    await sendTextMessage(userId, aiReply);
    console.log(`[Gemini] Đã trả lời ${userId} (${aiReply.length} ký tự)`);
    
    try {
      await payload.create({
        collection: 'zalo-message-logs',
        data: {
          zaloUserId: userId,
          direction: "outbound",
          type: "text",
          content: aiReply,
          rawPayload: JSON.stringify({ source: "ai" }),
          receivedAt: new Date().toISOString(),
        },
      });
    } catch (dbErr: any) {
      console.error("[ZALO WEBHOOK DB ERROR - OUTBOUND]", dbErr.message);
    }
  } catch (err: any) {
    console.error("[Gemini] Lỗi khi gọi AI:", err.message);
    let hotline = "1900988975";
    try {
      const dbConfig = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "hotline_main" } }, limit: 1 });
      if (dbConfig.docs.length > 0 && dbConfig.docs[0].value) hotline = dbConfig.docs[0].value;
    } catch(e) {}
    await sendTextMessage(
      userId,
      `Xin lỗi, hệ thống đang gặp sự cố nhỏ (Chi tiết: ${err.message}). Vui lòng thử lại sau hoặc liên hệ trực tiếp CDC Đà Nẵng qua hotline ${hotline} để được hỗ trợ nhanh nhất.`
    );
  }
}

async function handleFollow(userId: string, data: any, payload: any) {
  let displayName = data.follower?.display_name || "Người dùng Zalo";
  let avatarUrl = data.follower?.avatar || "";

  try {
    const { getUserProfile } = await import("@/lib/zalo");
    const profile = await getUserProfile(userId);
    if (profile?.data) {
      displayName = profile.data.display_name || displayName;
      avatarUrl = profile.data.avatar || avatarUrl;
    }
  } catch (err: any) {
    console.error("[ZALO WEBHOOK] Lỗi lấy profile follow:", err.message);
  }

  const existing = await payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 });
  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'zalo-followers',
      id: existing.docs[0].id,
      data: { displayName, avatarUrl }
    });
  } else {
    await payload.create({
      collection: 'zalo-followers',
      data: { zaloUserId: userId, displayName, avatarUrl, userType: "citizen", accessLevel: "basic" }
    });
  }

  let welcomeMsg = "";
  try {
    const welcomeConfig = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: "oa_welcome_msg" } }, limit: 1 });
    if (welcomeConfig.docs.length > 0 && welcomeConfig.docs[0].value) {
      welcomeMsg = welcomeConfig.docs[0].value.replace(/{displayName}/g, displayName).replace(/{name}/g, displayName);
    }
  } catch (dbErr: any) {}

  if (!welcomeMsg) {
    welcomeMsg = `Xin chào ${displayName}! Cảm ơn bạn đã quan tâm CDC Đà Nẵng.`;
  }

  await sendTextMessage(userId, welcomeMsg);
}

async function handleUnfollow(userId: string, payload: any) {
  try {
    const linkRes = await payload.find({ collection: 'zalo-staff-links', where: { zaloUserId: { equals: userId } }, limit: 1 });
    if (linkRes.docs.length > 0) {
      await payload.delete({ collection: 'zalo-staff-links', id: linkRes.docs[0].id });
      console.log(`[WEBHOOK] Xóa liên kết nhân viên: ${linkRes.docs[0].staffNameRaw} (${userId})`);
    }

    const folRes = await payload.find({ collection: 'zalo-followers', where: { zaloUserId: { equals: userId } }, limit: 1 });
    if (folRes.docs.length > 0) {
      await payload.update({
        collection: 'zalo-followers',
        id: folRes.docs[0].id,
        data: { userType: "citizen", department: null as any }
      });
    }

    clearUserHistory(userId);
    console.log(`[WEBHOOK] Unfollow xử lý xong: ${userId}`);
  } catch (e: any) {
    console.error(`[WEBHOOK] Lỗi xử lý unfollow ${userId}:`, e.message);
  }
}
