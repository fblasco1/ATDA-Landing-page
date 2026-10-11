import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("127.0.0.1")) {
    const url = req.nextUrl.clone();
    url.hostname = "localhost";
    return NextResponse.redirect(url);
  }

  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = Boolean(req.auth);

  const isAdminLogin = pathname.startsWith("/admin/login");
  const isAdminPage = pathname.startsWith("/admin") && !isAdminLogin;
  const isAdminApi = pathname.startsWith("/api/admin");

  const isSocioPublic =
    pathname === "/socio/login" ||
    pathname === "/socio/activar" ||
    pathname === "/socio/recuperar";
  const isSocioPage = pathname.startsWith("/socio") && !isSocioPublic;
  const isSocioApiPublic =
    pathname === "/api/socio/activate" || pathname === "/api/socio/recover";
  const isSocioApi = pathname.startsWith("/api/socio") && !isSocioApiPublic;

  if ((isAdminPage || isAdminApi) && (!isLoggedIn || role !== "admin")) {
    if (isAdminApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (role === "member") {
      return NextResponse.redirect(new URL("/socio", req.nextUrl.origin));
    }
    const login = new URL("/admin/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const mustChangePassword = role === "admin" && Boolean(req.auth?.user?.mustChangePassword);
  const isPasswordPage = pathname === "/admin/cambiar-clave";
  const isPasswordApi = pathname === "/api/admin/password";

  if (mustChangePassword && (isAdminPage || isAdminApi) && !isPasswordPage && !isPasswordApi) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Tenés que cambiar la contraseña" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin/cambiar-clave", req.nextUrl.origin));
  }

  if (isAdminLogin && isLoggedIn && role === "admin") {
    const target = mustChangePassword ? "/admin/cambiar-clave" : "/admin";
    return NextResponse.redirect(new URL(target, req.nextUrl.origin));
  }

  if ((isSocioPage || isSocioApi) && (!isLoggedIn || role !== "member")) {
    if (isSocioApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/socios", req.nextUrl.origin));
    }
    const login = new URL("/socio/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (isSocioPublic && isLoggedIn && role === "member") {
    return NextResponse.redirect(new URL("/socio", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
