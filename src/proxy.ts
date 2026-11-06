import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Checagem otimista: só olha se o cookie existe. A validação real da sessão
// acontece em requireUser() (src/lib/dal.ts) em cada leitura/escrita.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
