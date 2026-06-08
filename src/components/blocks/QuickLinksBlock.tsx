import React from 'react';
import Link from 'next/link';
import { FileText, BookOpen, Users, Calendar, Link as LinkIcon, Grid, Settings, MapPin } from 'lucide-react';

const ICON_MAP: any = {
  'FileText': FileText,
  'BookOpen': BookOpen,
  'Users': Users,
  'Calendar': Calendar,
  'Grid': Grid,
  'Settings': Settings,
  'MapPin': MapPin
};

export default function QuickLinksBlock({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gov-primary text-white p-4">
        <h3 className="font-bold uppercase text-center tracking-wide">{data.title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-[1px] bg-gray-100">
        {(data.links || []).map((linkItem: any, idx: number) => {
          const Icon = ICON_MAP[linkItem.icon] || LinkIcon;
          return (
            <Link key={idx} href={linkItem.url || '#'} className="bg-white p-5 flex flex-col items-center justify-center text-center hover:bg-gov-surface group transition-colors">
              <Icon className="text-gov-primary mb-3 group-hover:-translate-y-1 transition-transform" size={32} />
              <span className="text-sm font-semibold text-gray-800">{linkItem.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
