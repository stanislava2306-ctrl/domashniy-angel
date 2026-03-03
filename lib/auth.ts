import { redirect } from "next/navigation";
import { z } from "zod";
import type { Profile, Role } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  id: z.string().uuid(),
  role: z.union([z.literal("caregiver"), z.literal("senior")]),
  full_name: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: z.string()
});

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return profileSchema.parse(data);
}

export async function requireProfile(expectedRole?: Role): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (expectedRole && profile.role !== expectedRole) {
    redirect("/login");
  }

  return profile;
}

export async function signOutAction(): Promise<void> {
  "use server";

  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
