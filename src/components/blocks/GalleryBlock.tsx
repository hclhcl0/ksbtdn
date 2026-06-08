import React from 'react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function GalleryBlock({ data }: { data: any }) {
  const images = data.images || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gov-primary text-white p-3 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2" />
        <h2 className="font-bold uppercase tracking-wide">{data.title || 'Thư viện ảnh'}</h2>
      </div>
      <div className="p-4 bg-gray-50">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {images.slice(0, 4).map((img: any) => (
              <div key={img.id} className="relative aspect-square rounded-md overflow-hidden group cursor-pointer border border-gray-200">
                <Image 
                  src={`http://127.0.0.1:1337${img.url}`} 
                  alt={data.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center italic py-4">Chưa có hình ảnh.</div>
        )}
      </div>
    </div>
  );
}
