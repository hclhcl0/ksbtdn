import { getPayload } from 'payload';
import configPromise from '@payload-config';
import React from 'react';

export async function UploadBlock({ node, fallbackAlt }: { node: any, fallbackAlt?: string }) {
  console.log("UploadBlock received node:", node);
  if (!node?.value) return null;

  // If already populated
  if (typeof node.value === 'object' && node.value.url) {
    const altText = node.value.alt || fallbackAlt || "Hình ảnh minh họa";
    return (
      <span className="block my-6 w-full flex justify-center">
        <img 
          src={node.value.url} 
          alt={altText} 
          className="rounded-xl shadow-sm border border-gray-100" 
          style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      </span>
    );
  }

  // If it's an ID, fetch it!
  const mediaId = typeof node.value === 'string' || typeof node.value === 'number' 
    ? node.value 
    : (node.value?.id || null);
  if (!mediaId) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const media = await payload.findByID({
      collection: 'media',
      id: mediaId,
    });

    if (media?.url) {
      const altText = media.alt || fallbackAlt || "Hình ảnh minh họa";
      return (
        <span className="block my-6 w-full flex justify-center">
          <img 
            src={media.url} 
            alt={altText} 
            className="rounded-xl shadow-sm border border-gray-100" 
            style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </span>
      );
    }
  } catch (error) {
    console.error("Error fetching media for upload block:", error);
  }

  return null;
}
