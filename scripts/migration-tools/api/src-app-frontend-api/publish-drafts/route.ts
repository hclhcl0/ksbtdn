import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const drafts = await payload.find({ collection: 'articles', draft: true, limit: 1000 });
    const published = await payload.find({ collection: 'articles', limit: 1 });
    
    let newlyPublished = 0;
    if (drafts.docs.length > 0) {
        for (const doc of drafts.docs) {
            // @ts-ignore
            if (doc._status !== 'published') {
                try {
                    await payload.update({
                        collection: 'articles',
                        id: doc.id,
                        data: { _status: 'published' } as any
                    });
                    newlyPublished++;
                } catch(e){}
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        drafts: drafts.totalDocs, 
        published: published.totalDocs, 
        newlyPublished 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
