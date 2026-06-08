import React from 'react';
import BlockRenderer from '@/components/blocks/BlockRenderer';

async function getSidebar() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/sidebar?populate[blocks][populate]=*', { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Failed to fetch sidebar:", err);
    return null;
  }
}

export default function Sidebar({ data }: { data: any }) {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center text-sm text-gray-500">
        Sidebar chưa có nội dung
      </div>
    );
  }

  return (
    <aside className="w-full space-y-6">
      <BlockRenderer blocks={data.blocks} />
    </aside>
  );
}
