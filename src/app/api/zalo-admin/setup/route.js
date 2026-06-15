import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { getPayload } = await import("payload");
    const config = await import("@payload-config");
    const payload = await getPayload({ config: config.default });

    // 1. Kiểm tra xem đã có user nào chưa
    const existingUsers = await payload.find({
      collection: "users",
      limit: 1,
    });

    if (existingUsers.totalDocs === 0) {
      // 2. Tạo tài khoản admin mặc định
      const defaultAdmin = await payload.create({
        collection: "users",
        data: {
          email: "hclhcl0@gmail.com",
          password: "Admin@2026",
          name: "Quản trị viên CDC",
          role: "admin",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Khởi tạo tài khoản Quản trị viên mặc định thành công!",
        admin: defaultAdmin.email,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Hệ thống đã có tài khoản người dùng. Không cần khởi tạo thêm.",
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Lỗi hệ thống trong quá trình setup",
      error: err.message
    }, { status: 500 });
  }
}
