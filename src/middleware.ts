import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Tracking xem payload đã được init chưa
let payloadInitialized = false;

export async function middleware(request: NextRequest) {
  // Chỉ áp dụng cho các trang frontend, bỏ qua admin và API
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Pass through - Payload init sẽ được xử lý trong từng component
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
