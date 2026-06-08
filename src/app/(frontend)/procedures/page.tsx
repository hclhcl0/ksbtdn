export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileCheck, Download, Info } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

async function getProcedures() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'documents', // Use documents since procedures collection isn't defined
      sort: '-publishedDate',
      limit: 100,
    });
    return docs;
  } catch (err) {
    console.error('Failed to fetch procedures:', err);
    return [];
  }
}

export default async function ProceduresPage() {
  const procedures = await getProcedures();

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      <div className="flex items-center text-sm text-gray-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
        <span className="font-medium text-gov-primary">Thủ tục hành chính</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gov-primary mb-8 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
        Quy trình & Thủ tục hành chính / Văn bản
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {procedures.map((proc: any) => {
          const fileObj = proc.file;
          const hasFile = !!fileObj;
          const fileUrl = hasFile ? fileObj.url : '#';

          return (
            <div key={proc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="bg-blue-50/50 p-5 border-b border-gray-100 flex-grow">
                <div className="flex items-start">
                  <div className="bg-gov-primary/10 p-2 rounded-lg text-gov-primary mr-4 mt-1">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gov-primary leading-tight mb-2">{proc.title}</h3>
                    {proc.issuer && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Cơ quan thực hiện: <span className="text-gov-secondary">{proc.issuer}</span>
                      </p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3">
                      Số hiệu: {proc.documentNumber}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Info className="w-4 h-4 mr-1 text-gray-400" />
                  {new Date(proc.publishedDate).toLocaleDateString('vi-VN')}
                </div>
                
                {hasFile ? (
                  <a 
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Tải biểu mẫu đính kèm"
                    className="inline-flex items-center px-3 py-1.5 bg-gov-primary text-white hover:bg-blue-700 rounded-md text-sm font-bold transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Tải về
                  </a>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-500 rounded-md text-sm font-bold cursor-not-allowed">
                    Không có biểu mẫu
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {procedures.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Hệ thống đang cập nhật danh sách văn bản / thủ tục hành chính.</p>
          </div>
        )}
      </div>
    </div>
  );
}
