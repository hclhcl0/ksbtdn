import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET() {
    try {
        const payload = await getPayload({ config: configPromise });
        
        // Cập nhật toàn bộ bài viết sang trạng thái published
        const result = await payload.update({
            collection: 'articles',
            where: {
                id: { exists: true }
            },
            data: {
                _status: 'published'
            }
        });

        return NextResponse.json({ success: true, message: `Đã publish thành công ${result.docs.length} bài viết!` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
