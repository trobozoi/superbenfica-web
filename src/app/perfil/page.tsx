import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = { title: "Minha conta" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Minha conta" />
      <ProfileView />
    </>
  );
}
