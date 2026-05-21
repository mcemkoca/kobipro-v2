import { getEmployeeDashboard } from "@/app/actions/employee";
import { redirect } from "next/navigation";
import EmployeeClient from "./EmployeeClient";

export default async function EmployeePage() {
  const data = await getEmployeeDashboard();
  if (!data) {
    redirect("/login?error=session_expired");
  }

  return (
    <EmployeeClient
      user={data.user}
      tasks={data.tasks}
      weeklySchedule={data.weeklySchedule}
      stats={data.stats}
      scheduleSlots={data.scheduleSlots}
      todayTasks={data.todayTasks}
      notifications={data.notifications}
    />
  );
}
