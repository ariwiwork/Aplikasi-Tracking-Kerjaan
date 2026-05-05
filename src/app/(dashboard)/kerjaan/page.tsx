import { prisma } from "@/lib/prisma";
import ProjectClient from "./ProjectClient";

export const dynamic = "force-dynamic";

export default async function KerjaanPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Daftar Kerjaan</h1>
      </div>
      <ProjectClient initialProjects={projects} />
    </div>
  );
}
