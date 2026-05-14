import SystemStatusPanel from "@/components/dashboard/SystemStatusPanel";
import SystemMetrics from "@/components/dashboard/SystemMetrics";
import AssistantOrb from "@/components/dashboard/AssistantOrb";

export default function DashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:items-stretch lg:justify-center lg:gap-12">
      <div className="flex w-full max-w-md flex-col gap-6">
        <SystemStatusPanel />
        <SystemMetrics />
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <AssistantOrb />
      </div>
    </div>
  );
}
