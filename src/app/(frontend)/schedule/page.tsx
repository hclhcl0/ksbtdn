import React from 'react';
import Link from 'next/link';
import { ChevronRight, CalendarDays, Clock, MapPin, Users } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
      <div className="flex items-center text-sm text-gray-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
        <span className="font-medium text-gov-primary">Lịch công tác</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gov-primary mb-8 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
        Lịch Làm Việc Cơ Quan
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-12 text-center">
        <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Chưa có lịch công tác</h2>
        <p className="text-gray-500 mb-8 md:mb-10">Lịch công tác tuần này đang được cập nhật. Vui lòng quay lại sau.</p>
        
        <div className="max-w-lg mx-auto p-5 md:p-6 bg-blue-50/50 border border-blue-100 rounded-xl text-left">
          <h3 className="font-bold text-gov-primary text-lg flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-gov-secondary" /> Lịch biểu dự kiến (Mẫu)
          </h3>
          <ul className="space-y-4 md:space-y-5 text-sm md:text-base text-gray-800">
            <li className="flex items-start">
              <div className="w-2.5 h-2.5 rounded-full bg-gov-secondary mt-1.5 mr-3 md:mr-4 flex-shrink-0 shadow-sm"></div>
              <div>
                <strong className="block md:inline text-gray-900">08:00 - Thứ Hai: </strong> 
                Giao ban tuần khối văn phòng.
                <div className="text-gray-500 flex items-center mt-1.5 text-sm font-medium"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> Phòng họp A</div>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-2.5 h-2.5 rounded-full bg-gov-primary mt-1.5 mr-3 md:mr-4 flex-shrink-0 shadow-sm"></div>
              <div>
                <strong className="block md:inline text-gray-900">14:00 - Thứ Tư: </strong> 
                Tiếp công dân và giải quyết khiếu nại.
                <div className="text-gray-500 flex items-center mt-1.5 text-sm font-medium"><Users className="w-4 h-4 mr-1 text-gray-400" /> Phòng tiếp dân</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
