import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");

  return (
    <SettingsClient
      userName={user.name}
      userEmail={user.email}
      userRole={user.role}
    />
  );
}
