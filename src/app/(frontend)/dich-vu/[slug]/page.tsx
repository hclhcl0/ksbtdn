import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, HeartPulse, Tag, Phone, ShieldCheck, ShoppingCart, Calendar } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getService(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Check if slug is an ID or actual slug
    let query = {};
    if (slug.match(/^[0-9a-fA-F]{24}$/) || !isNaN(Number(slug))) {
      query = { id: { equals: slug } };
    } else {
      query = { slug: { equals: slug } };
    }

    const { docs } = await payload.find({
      collection: 'services',
      where: query,
      limit: 1,
    });

    return docs[0] || null;
  } catch (err) {
    console.error('Failed to fetch service:', err);
    return null;
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  const thumbObj = service.thumbnail as any;
  const thumbUrl = thumbObj?.url || null;

  // Helper to render rich text
  const renderRichText = (content: any) => {
    if (!content) return null;
    
    // Basic rendering for Payload Lexical/Slate JSON structure
    if (typeof content === 'object' && content.root && content.root.children) {
      return (
        <div className="prose prose-base md:prose-lg max-w-none break-words prose-p:!my-1.5 md:prose-p:!my-2 prose-headings:!my-3 md:prose-headings:!my-4 prose-ul:!my-1 prose-li:!my-0.5 prose-img:!my-3 prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
          {content.root.children.map((block: any, i: number) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="mb-5">
                  {block.children?.map((textNode: any, j: number) => (
                    <span key={j} className={
                      [
                        textNode.format & 1 ? 'font-bold text-gray-900' : '',
                        textNode.format & 2 ? 'italic' : '',
                        textNode.format & 8 ? 'underline' : '',
                      ].filter(Boolean).join(' ')
                    }>
                      {textNode.text}
                    </span>
                  ))}
                </p>
              );
            }
            if (block.type === 'heading') {
              const Tag = `h${block.tag}` as any;
              return (
                <Tag key={i} className="font-bold text-gov-primary mt-8 mb-4">
                  {block.children?.map((textNode: any, j: number) => (
                    <span key={j}>{textNode.text}</span>
                  ))}
                </Tag>
              )
            }
            if (block.type === 'list') {
              const ListTag = block.listType === 'bullet' ? 'ul' : 'ol';
              return (
                <ListTag key={i} className={`mb-6 pl-6 space-y-2 ${block.listType === 'bullet' ? 'list-disc marker:text-gov-primary' : 'list-decimal marker:text-gov-primary marker:font-bold'}`}>
                  {block.children?.map((item: any, j: number) => (
                    <li key={j} className="pl-2">
                      {item.children?.map((textNode: any, k: number) => (
                        <span key={k} className={textNode.format & 1 ? 'font-bold' : ''}>{textNode.text}</span>
                      ))}
                    </li>
                  ))}
                </ListTag>
              )
            }
            return null;
          })}
        </div>
      );
    }
    
    return <div className="text-gray-700">{JSON.stringify(content)}</div>;
  };

  const isActive = service.status === 'active';

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-8 pb-4 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 opacity-50" />
          <Link href="/dich-vu" className="hover:text-gov-primary transition-colors whitespace-nowrap">Dịch vụ - Sản phẩm</Link>
          
          {service.category && typeof service.category === 'object' && (
            <>
              <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 opacity-50" />
              <Link href={`/dich-vu?danhmuc=${service.category.slug}`} className="hover:text-gov-primary transition-colors whitespace-nowrap">
                {service.category.name}
              </Link>
            </>
          )}
        </div>

        <Link href="/dich-vu" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-gov-primary transition-colors mb-6 group">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gov-primary group-hover:bg-blue-50 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Quay lại danh sách
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Top Section: Image + Basic Info */}
          <div className="flex flex-col lg:flex-row border-b border-gray-100">
            {/* Image Box */}
            <div className="lg:w-2/5 xl:w-1/2 relative bg-gray-100 flex items-center justify-center overflow-hidden min-h-[300px] lg:min-h-full">
              {thumbUrl ? (
                <img 
                  src={thumbUrl} 
                  alt={service.title} 
                  className="w-full h-full object-cover absolute inset-0" 
                />
              ) : (
                <div className="text-teal-200">
                  <HeartPulse className="w-32 h-32" />
                </div>
              )}
              {/* Overlay Gradient for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {!isActive && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-1.5 rounded-full font-bold shadow-lg">
                  TẠM NGƯNG
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="lg:w-3/5 xl:w-1/2 p-8 md:p-12 lg:p-14 bg-white flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 opacity-50"></div>
              
              <div className="relative z-10">
                {service.category && typeof service.category === 'object' && (
                  <span className="inline-block px-4 py-1.5 bg-teal-50 text-gov-primary text-xs font-bold rounded-full uppercase tracking-wider mb-4 border border-teal-100">
                    {service.category.name}
                  </span>
                )}
                
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 text-gray-900">
                  {service.title}
                </h1>
                
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  {service.shortDescription}
                </p>

                <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 mb-8 inline-block min-w-[60%]">
                  <div className="text-rose-400 text-sm font-bold uppercase tracking-wider mb-1 flex items-center">
                    <Tag className="w-4 h-4 mr-1.5" /> Mức phí / Giá niêm yết
                  </div>
                  <div className="text-3xl font-extrabold text-rose-600">
                    {service.price || 'Đang cập nhật'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {service.bookingUrl ? (
                    <a 
                      href={service.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex justify-center items-center py-4 px-6 bg-gov-primary hover:bg-gov-primary-dark text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-gov-primary/30 hover:shadow-xl hover:shadow-gov-primary/40 hover:-translate-y-1"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Đăng ký trực tuyến
                    </a>
                  ) : null}

                  {service.contactPhone ? (
                    <a 
                      href={`tel:${service.contactPhone.replace(/\D/g,'')}`}
                      className={`flex-1 flex justify-center items-center py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                        service.bookingUrl 
                          ? 'bg-white border-2 border-gov-primary text-gov-primary hover:bg-teal-50' 
                          : 'bg-gov-primary hover:bg-gov-primary-dark text-white shadow-lg shadow-gov-primary/30 hover:-translate-y-1'
                      }`}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {service.contactPhone}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Content Section */}
          <div className="p-8 md:p-12 lg:p-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 flex items-center">
              <ShieldCheck className="w-7 h-7 mr-3 text-gov-primary" />
              Thông tin chi tiết dịch vụ
            </h2>
            
            <div className="max-w-4xl">
              {service.content ? (
                renderRichText(service.content)
              ) : (
                <div className="bg-gray-50 p-8 rounded-2xl text-center border border-gray-100">
                  <p className="text-gray-500">Thông tin chi tiết đang được cập nhật.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
