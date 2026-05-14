import WorkspaceExperience from "@/components/layout/WorkspaceExperience";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceExperience>{children}</WorkspaceExperience>;
}
