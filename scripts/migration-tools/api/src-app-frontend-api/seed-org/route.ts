import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(req: Request) {
  const payload = await getPayload({ config: configPromise });

  const orgUnits = [
    {
      name: 'Ban Giám đốc',
      unitType: 'ban_lanh_dao',
      order: 1,
      members: [
        { memberName: 'Nguyễn Đại Vĩnh', position: 'giam_doc' },
        { memberName: 'Lê Thành Chung', position: 'pho_giam_doc' },
        { memberName: 'Võ Trung Hoàng', position: 'pho_giam_doc' },
      ],
    },
    {
      name: 'Phòng Tổ chức - Hành chính',
      unitType: 'phong',
      order: 2,
      members: [
        { memberName: 'Trần Liên', position: 'truong' },
        { memberName: 'Lưu Thị Mận', position: 'pho_truong' },
        { memberName: 'Nguyễn Thị Hoàng Việt', position: 'nhan_vien' },
      ],
    },
    {
      name: 'Phòng Kế hoạch - Nghiệp vụ',
      unitType: 'phong',
      order: 3,
      members: [
        { memberName: 'Trần Văn Vũ', position: 'truong' },
        { memberName: 'Đỗ Ích Thành', position: 'pho_truong' },
        { memberName: 'Nguyễn Lợi', position: 'nhan_vien' },
      ],
    },
    {
      name: 'Phòng Tài chính - Kế toán',
      unitType: 'phong',
      order: 4,
      members: [
        { memberName: 'Hồ Phú Quảng', position: 'truong' },
        { memberName: 'Nguyễn Thị Bích Thuỷ', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa Phòng chống bệnh truyền nhiễm',
      unitType: 'khoa',
      order: 5,
      members: [
        { memberName: 'Đặng Quang Ánh', position: 'truong' },
        { memberName: 'Võ Thị Thùy Trang', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa phòng chống HIV/AIDS',
      unitType: 'khoa',
      order: 6,
      members: [
        { memberName: 'Cao Minh Thông', position: 'truong' },
        { memberName: 'Nguyễn Khắc Huy', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa phòng, chống bệnh không lây nhiễm',
      unitType: 'khoa',
      order: 7,
      members: [
        { memberName: 'Bùi Thị Long Cảnh', position: 'truong' },
        { memberName: 'Nguyễn Văn Hạnh', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa Dinh dưỡng',
      unitType: 'khoa',
      order: 8,
      members: [
        { memberName: 'Vũ Ngọc Hoàng', position: 'truong' },
        { memberName: 'Nguyễn Thị Hoàng Yến', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa Sức khỏe môi trường - Y tế trường học',
      unitType: 'khoa',
      order: 9,
      members: [
        { memberName: 'Võ Thị Duy Lệ', position: 'truong' },
        { memberName: 'Đặng Thị Kim Nguyên', position: 'pho_truong' },
        { memberName: 'Huỳnh Thị Thúy Loan', position: 'nhan_vien' },
      ],
    },
    {
      name: 'Khoa Bệnh nghề nghiệp',
      unitType: 'khoa',
      order: 10,
      members: [
        { memberName: 'Dương Ấm Mậu', position: 'truong' },
        { memberName: 'Lê Đức Đoàn', position: 'pho_truong' },
        { memberName: 'Ngô Quang Việt Nhi', position: 'nhan_vien' },
      ],
    },
    {
      name: 'Khoa chăm sóc sức khỏe sinh sản',
      unitType: 'khoa',
      order: 11,
      members: [
        { memberName: 'Trần Thị Dạ Thảo', position: 'truong' },
        { memberName: 'Hà Thị Diệu Yến', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa Truyền thông, giáo dục sức khỏe',
      unitType: 'khoa',
      order: 12,
      members: [
        { memberName: 'Nguyễn Hữu Quý', position: 'truong' },
        { memberName: 'Hồ Thị Tâm', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa Ký sinh trùng - Côn trùng',
      unitType: 'khoa',
      order: 13,
      members: [
        { memberName: 'Trương Công Phước', position: 'truong' },
        { memberName: 'Nguyễn Đức Vinh', position: 'pho_truong' },
        { memberName: 'Nguyễn Như Tiến', position: 'nhan_vien' },
        { memberName: 'Dương Quốc Thảo', position: 'nhan_vien' },
      ],
    },
    {
      name: 'Khoa Kiểm dịch Y tế quốc tế',
      unitType: 'khoa',
      order: 14,
      members: [
        { memberName: 'Phan Văn Bửu', position: 'truong' },
        { memberName: 'Phan Thị Thúy Liên', position: 'pho_truong' },
        { memberName: 'Lê Dũng', position: 'nhan_vien' },
      ],
    },
    {
      name: 'Khoa Dược - Vật tư Y tế',
      unitType: 'khoa',
      order: 15,
      members: [
        { memberName: 'Mai Thị Tính', position: 'truong' },
        { memberName: 'Nguyễn Công Ẩn', position: 'pho_truong' },
      ],
    },
    {
      name: 'Khoa Xét nghiệm - CĐHA - TDCN',
      unitType: 'khoa',
      order: 16,
      members: [
        { memberName: 'Nguyễn Trường Duy', position: 'truong' },
      ],
    },
    {
      name: 'Phòng khám đa khoa',
      unitType: 'khac',
      order: 17,
      members: [
        { memberName: 'Trương Tấn Nam', position: 'truong' },
        { memberName: 'Đỗ Văn Lân', position: 'pho_truong' },
        { memberName: 'Trần Đình Vũ', position: 'nhan_vien' },
      ],
    },
  ];

  try {
    // Xóa dữ liệu cũ (nếu có) để tránh trùng lặp khi chạy nhiều lần
    const existing = await payload.find({
      collection: 'org-units',
      limit: 100,
    });
    
    for (const doc of existing.docs) {
      await payload.delete({
        collection: 'org-units',
        id: doc.id,
      });
    }

    // Insert dữ liệu mới
    for (const unit of orgUnits) {
      await payload.create({
        collection: 'org-units',
        data: unit as any,
      });
    }

    return Response.json({ success: true, message: `Đã tạo thành công ${orgUnits.length} đơn vị tổ chức!` });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
