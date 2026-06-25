import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

async function getPayloadClient() {
  return getPayload({ config });
}

export async function GET() {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "api-keys",
      where: { provider: { equals: "groq" } },
      limit: 100,
    });
    return NextResponse.json({
      success: true,
      data: result.docs.map((d) => ({
        id: d.id,
        label: d.label,
        provider: d.provider,
        isActive: d.isActive,
        createdAt: d.createdAt,
      })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { label, apiKey } = await request.json();
    if (!label || !apiKey) {
      return NextResponse.json({ success: false, error: "Thiếu label hoặc apiKey" }, { status: 400 });
    }
    const payload = await getPayloadClient();
    await payload.create({
      collection: "api-keys",
      data: { label, key: apiKey, provider: "groq", isActive: true },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, isActive } = await request.json();
    const payload = await getPayloadClient();
    await payload.update({ collection: "api-keys", id, data: { isActive } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    const payload = await getPayloadClient();
    await payload.delete({ collection: "api-keys", id });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
