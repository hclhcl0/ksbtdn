import { NextResponse } from "next/server";
import { prisma } from "@/lib/zalo-admin/prisma";
import { getZaloSession } from "@/lib/zalo-admin/payload-auth";


export async function GET(request, { params }) {
  try {
    const session = await getZaloSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID không hợp lệ" }, { status: 400 });
    }

    const doc = await prisma.aiKnowledge.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ success: false, error: "Tài liệu không tồn tại" }, { status: 404 });
    }

    if (session.user.role === "staff") {
      if (doc.category !== session.user.department) {
        return NextResponse.json({ success: false, error: "Không có quyền xem tài liệu của phòng ban khác" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error("[GET /api/knowledge/[id]] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
