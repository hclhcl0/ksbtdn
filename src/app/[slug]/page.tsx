import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { RichText } from '@payloadcms/richtext-lexical/react';

async function getPageBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });
    return docs.length > 0 ? docs[0] : null;
  } catch (err) {
    console.error('Failed to fetch page:', err);
    return null;
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const page = await getPageBySlug(slug);

  if (!page) {
    notFound(); 
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-gov-primary mb-8 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
        {page.title}
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
        {page.content ? (
           <div className="prose max-w-none">
             <RichText data={page.content} />
           </div>
        ) : (
          <div className="text-gray-500 text-center py-10">Nội dung đang được cập nhật...</div>
        )}
      </div>
    </div>
  );
}
