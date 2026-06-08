import React from 'react';
import { Link2 } from 'lucide-react';
import Image from 'next/image';

export default function ExternalLinksBlock({ data }: { data: any }) {
  const links = data.links || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gov-primary text-white p-3 flex items-center">
        <Link2 className="w-5 h-5 mr-2" />
        <h2 className="font-bold uppercase tracking-wide">{data.title || 'Liên kết website'}</h2>
      </div>
      <div className="p-4 space-y-3 bg-gray-50">
        {links.map((link: any, idx: number) => {
          const imageUrl = link.image ? `http://127.0.0.1:1337${link.image.url}` : null;
          return (
            <a 
              key={link.id || idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-gray-200 hover:shadow-md hover:border-gov-primary transition-all group"
            >
              {imageUrl ? (
                <div className="relative w-full h-20 bg-white">
                  <Image 
                    src={imageUrl} 
                    alt={link.label || 'Liên kết'} 
                    fill 
                    className="object-contain p-1 group-hover:scale-105 transition-transform" 
                  />
                </div>
              ) : (
                <div className="w-full h-16 bg-white flex items-center justify-center text-gov-primary font-medium p-2 text-center text-sm">
                  {link.label || link.url}
                </div>
              )}
            </a>
          );
        })}

        {links.length === 0 && (
          <div className="text-gray-400 text-sm text-center italic py-4">Chưa có liên kết nào.</div>
        )}
      </div>
    </div>
  );
}
