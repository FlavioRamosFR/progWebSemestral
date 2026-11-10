import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const usuarioLogado = request.cookies.has("connect.sid");
  if (!usuarioLogado) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/rgr/:path*"],
};
