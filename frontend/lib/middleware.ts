// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // Verifica se o token é válido
  const verifiedToken = token ? await verifyToken(token) : null;

  // Se o usuário tentar acessar o dashboard sem token, manda para o login
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!verifiedToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Se o usuário já estiver logado e tentar ir para o login, manda para o dashboard
  if (request.nextUrl.pathname === "/login") {
    if (verifiedToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Configura em quais rotas o middleware deve rodar
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
