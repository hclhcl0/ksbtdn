import React from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBlock({ data }: { data: any }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-8 flex items-center shadow-sm">
      <AlertCircle className="w-5 h-5 mr-3 text-gov-secondary flex-shrink-0" />
      <span className="font-semibold mr-2 whitespace-nowrap">{data.title}</span>
      {data.link ? (
        <Link href={data.link} className="truncate hover:underline">
          {data.text}
        </Link>
      ) : (
        <span className="truncate">{data.text}</span>
      )}
    </div>
  );
}
