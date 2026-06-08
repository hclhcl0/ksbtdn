import React from 'react';
import { Landmark } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gov-primary-dark text-white pt-12 pb-6 border-t-4 border-gov-secondary transition-colors duration-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Landmark className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 flex-shrink-0" />
              <h2 className="text-lg md:text-xl font-bold uppercase">Cổng Thông Tin Điện Tử<br/>Cơ Quan Quản Lý Nhà Nước</h2>
            </div>
            <p className="text-sm text-blue-200 mb-2">Giấy phép hoạt động: Số 01/GP-BTTTT cấp ngày 01/01/2026.</p>
            <p className="text-sm text-blue-200 mb-2">Chịu trách nhiệm chính: Trưởng Ban Biên Tập.</p>
          </div>
          <div className="text-sm text-blue-200 space-y-3">
            <p className="flex items-start md:items-center">
              <strong className="w-24 text-white flex-shrink-0">Cơ quan:</strong> 
              <span>Bộ / Ban / Ngành chủ quản</span>
            </p>
            <p className="flex items-start md:items-center">
              <strong className="w-24 text-white flex-shrink-0">Địa chỉ:</strong> 
              <span>Số 1, Đường Quốc gia, Quận Trung tâm, TP. Thủ Đô</span>
            </p>
            <p className="flex items-start md:items-center">
              <strong className="w-24 text-white flex-shrink-0">Điện thoại:</strong> 
              <span>(024) 3xxxxxxx - Fax: (024) 3xxxxxxx</span>
            </p>
            <p className="flex items-start md:items-center">
              <strong className="w-24 text-white flex-shrink-0">Email:</strong> 
              <span className="break-all">banbientap@coquannhanuoc.gov.vn</span>
            </p>
          </div>
        </div>
        <div className="border-t border-gov-primary pt-6 text-center text-xs text-blue-300">
          &copy; Bản quyền thuộc Cổng Thông tin điện tử Cơ quan Quản lý Nhà nước.<br className="md:hidden" />
          <span className="hidden md:inline"> </span>Ghi rõ nguồn khi phát hành lại thông tin từ Cổng thông tin điện tử này.
        </div>
      </div>
    </footer>
  );
}
