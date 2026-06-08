"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    title: '',
    content: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: formData })
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ fullName: '', email: '', title: '', content: '' }); // reset
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      <div className="flex items-center text-sm text-gray-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
        <span className="font-medium text-gov-primary">Hỏi đáp - Liên hệ</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột thông tin liên hệ */}
        <div className="md:col-span-1 space-y-6">
          <h1 className="text-2xl font-bold text-gov-primary mb-6 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
            Thông tin liên hệ
          </h1>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">SỞ Y TẾ TP. ĐÀ NẴNG</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gov-secondary mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-600">315 Phan Châu Trinh, Phường Bình Hiên, Quận Hải Châu, TP. Đà Nẵng</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gov-secondary mr-3 flex-shrink-0" />
                <span className="text-gray-600">(0236) 3810 034</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gov-secondary mr-3 flex-shrink-0" />
                <span className="text-gray-600">ksbtdana@danang.gov.vn</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-gov-primary mb-2">Giờ làm việc</h3>
            <p className="text-gray-600 text-sm">Thứ 2 - Thứ 6: 07:30 - 11:30 | 13:30 - 17:30<br/>Thứ 7, CN, Lễ: Nghỉ</p>
          </div>
        </div>

        {/* Cột Form */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gov-primary mb-6 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
            Gửi câu hỏi / Góp ý
          </h2>
          
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gửi thành công!</h3>
                <p>Cảm ơn bạn đã liên hệ. Chúng tôi đã ghi nhận thông tin và sẽ phản hồi trong thời gian sớm nhất.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-2 bg-gov-primary text-white rounded-md font-medium hover:bg-blue-800 transition-colors"
                >
                  Gửi thêm câu hỏi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gov-primary focus:border-gov-primary outline-none transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gov-primary focus:border-gov-primary outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gov-primary focus:border-gov-primary outline-none transition-all"
                    placeholder="Vấn đề bạn quan tâm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={5}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gov-primary focus:border-gov-primary outline-none transition-all resize-none"
                    placeholder="Nhập nội dung chi tiết..."
                  ></textarea>
                </div>

                {status === 'error' && (
                  <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-100">
                    Có lỗi xảy ra khi gửi. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau!
                  </div>
                )}

                <button 
                  disabled={status === 'loading'}
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-gov-primary text-white rounded-md font-bold hover:bg-blue-800 transition-colors flex items-center justify-center disabled:opacity-70 shadow-md"
                >
                  {status === 'loading' ? 'Đang xử lý...' : (
                    <>
                      <Send className="w-5 h-5 mr-2" /> Gửi Liên Hệ
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
