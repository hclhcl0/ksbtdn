import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';

interface Props { content: any; }

export function PageRichTextBlock({ content }: Props) {
  if (!content) return null;

  return (
    <div className="prose prose-lg max-w-none prose-headings:text-[var(--primary)] prose-a:text-[var(--secondary)] hover:prose-a:text-[var(--primary)] prose-img:rounded-xl my-6">
      <RichText data={content} converters={getJsxConverters('Hình ảnh minh họa')} />
    </div>
  );
}
