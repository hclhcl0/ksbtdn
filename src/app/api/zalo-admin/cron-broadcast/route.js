import { NextResponse } from "next/server";
import { prisma } from "@/lib/zalo-admin/prisma";
import { sendPromotionMessage } from "@/lib/zalo-admin/zalo";
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = "force-dynamic";

// Secret Token để chống người lạ gọi API
const CRON_SECRET = process.env.CRON_SECRET || "zalo-cdc-cron-secret-123";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Xác thực
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Payload Articles từ 24h qua (chỉ lấy những bài chưa tự động gửi)
    const payload = await getPayload({ config: configPromise });
    
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const payloadArticles = await payload.find({
      collection: 'articles',
      where: {
        _status: { equals: 'published' },
        updatedAt: { greater_than_equal: yesterday.toISOString() },
        autoZaloBroadcast: { not_equals: true } // Bỏ qua các bài đã tick "tự động gửi"
      },
      limit: 5,
      sort: '-createdAt'
    });

    if (!payloadArticles.docs || payloadArticles.docs.length === 0) {
      return NextResponse.json({ message: "Không có bài viết mới nào trong 24h qua." });
    }

    // 2. Format thành elements của Zalo List Message
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
    
    const elements = payloadArticles.docs.map(doc => {
      let coverUrl = '';
      if (doc.image && typeof doc.image === 'object' && doc.image.url) {
        coverUrl = doc.image.url;
      } else if (typeof doc.image === 'string') {
        coverUrl = doc.image;
      }

      return {
        title: doc.title.substring(0, 120),
        subtitle: doc.description ? doc.description.substring(0, 120) : doc.title.substring(0, 120),
        imageUrl: coverUrl,
        actionType: "oa.open.url",
        actionValue: `${baseUrl}/bai-viet/${doc.slug}`
      };
    });

    const broadcastData = {
      scope: "all",
      messageType: "list",
      elements: elements
    };

    // 3. Lấy người quan tâm & lưu Log
    const followers = await prisma.follower.findMany({
      select: { zaloUserId: true }
    });
    const userIds = followers.map(f => f.zaloUserId);

    if (userIds.length === 0) {
      return NextResponse.json({ message: "Không có người quan tâm nào để gửi." });
    }

    const payloadStr = JSON.stringify(broadcastData);
    const broadcastLog = await prisma.zaloBroadcast.create({
      data: {
        scope: "all",
        content: "Bản tin tổng hợp (Cron Job)",
        rawPayload: payloadStr,
        total: userIds.length,
        sentCount: 0,
        successCount: 0,
        failCount: 0,
        status: "sending",
        createdBy: "Cron Job",
      },
    });

    // 4. Chạy ngầm việc gửi tin
    setTimeout(async () => {
      let success = 0;
      let fail = 0;

      for (const uid of userIds) {
        try {
          const result = await sendPromotionMessage(uid, broadcastData);
          if (result && result.error === 0) {
            success++;
          } else {
            fail++;
          }
        } catch (err) {
          fail++;
        }
        await new Promise(res => setTimeout(res, 100)); // Rate limit 10/s
      }

      await prisma.zaloBroadcast.update({
        where: { id: broadcastLog.id },
        data: {
          status: "completed",
          sentCount: success + fail,
          successCount: success,
          failCount: fail,
          completedAt: new Date(),
        },
      });
    }, 100);

    return NextResponse.json({ 
      message: "Đã bắt đầu gửi tin tổng hợp", 
      articleCount: elements.length, 
      followerCount: userIds.length 
    });

  } catch (err) {
    console.error("Cron Broadcast Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
