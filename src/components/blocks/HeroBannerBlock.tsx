import React from 'react';
import Link from 'next/link';

export default function HeroBannerBlock({ data }: { data: any }) {
  // data: { title, description, link, tag, image }
  const imageUrl = data.image?.url ? data.image.url : null;
  
  return (
    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 relative group overflow-hidden mb-8">
      <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg">
        {imageUrl && (
          <img src={imageUrl} alt={data.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gov-primary/20 group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute bottom-0 p-6 text-white w-full z-20">
          {data.tag && <span className="bg-gov-secondary text-xs font-bold px-3 py-1 mb-3 inline-block rounded-sm">{data.tag}</span>}
          <h2 className="text-xl md:text-3xl font-bold mb-2 leading-snug group-hover:text-yellow-400 transition-colors">
            {data.link ? <Link href={data.link}>{data.title}</Link> : data.title}
          </h2>
          {data.description && <p className="text-gray-200 text-sm line-clamp-2">{data.description}</p>}
        </div>
      </div>
    </div>
  );
}
