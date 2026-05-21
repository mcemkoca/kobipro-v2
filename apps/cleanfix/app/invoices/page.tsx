import { getInvoices } from "@/app/actions/invoices";
import { redirect } from "next/navigation";
import InvoicesClient from "./InvoicesClient";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  if (!invoices || invoices.length === 0) {
    redirect("/login?error=session_expired");
  }

  return <InvoicesClient invoices={invoices} />;
}
