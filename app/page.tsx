import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LandingPage } from "@/components/app/landing-page";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (profile?.role === "caregiver") {
    redirect("/app/caregiver");
  }

  if (profile?.role === "senior") {
    redirect("/app/senior");
  }

  return <LandingPage />;
}
