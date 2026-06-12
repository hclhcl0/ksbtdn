import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET() {
    try {
        const payload = await getPayload({ config: configPromise });
        await payload.delete({ collection: 'articles', where: { id: { exists: true } }, limit: 10000 });
        try { await payload.delete({ collection: 'tags', where: { id: { exists: true } }, limit: 10000 }); } catch (e) {}
        return NextResponse.json({ success: true, message: 'Wiped all articles and tags!' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
