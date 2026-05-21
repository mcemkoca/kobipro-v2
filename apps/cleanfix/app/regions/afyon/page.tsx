import { getAfyonDashboard } from "@/app/actions/afyon";
import { redirect } from "next/navigation";
import AfyonClient from "./AfyonClient";

export default async function AfyonPage() {
  const data = await getAfyonDashboard();
  if (!data) {
    redirect("/login?error=session_expired");
  }

  return (
    <AfyonClient
      customers={data.customers}
      invoices={data.invoices}
      stats={data.stats}
    />
  );
}
