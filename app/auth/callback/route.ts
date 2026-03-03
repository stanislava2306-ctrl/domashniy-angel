import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Role } from "@/lib/domain";

function resolveRole(value: string | undefined): Role {
  return value === "senior" ? "senior" : "caregiver";
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const pendingCookies: Array<{
    name: string;
    value: string;
    options: CookieOptions;
  }> = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        pendingCookies.push({ name, value, options });
      },
      remove(name: string, options: CookieOptions) {
        pendingCookies.push({
          name,
          value: "",
          options: { ...options, maxAge: 0 }
        });
      }
    }
  });

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let target = "/login";

  if (user) {
    const roleHint = resolveRole(request.cookies.get("role_hint")?.value);
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: user.id,
        role: roleHint,
        full_name: (user.user_metadata?.full_name as string | undefined) ?? null
      });
      target = roleHint === "senior" ? "/app/senior" : "/app/caregiver";
    } else {
      target = existingProfile.role === "senior" ? "/app/senior" : "/app/caregiver";
    }
  }

  if (requestedNext && requestedNext.startsWith("/app/")) {
    target = requestedNext;
  }

  const response = NextResponse.redirect(new URL(target, request.url));

  for (const cookie of pendingCookies) {
    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      ...cookie.options
    });
  }

  response.cookies.set({ name: "role_hint", value: "", path: "/", maxAge: 0 });

  return response;
}
