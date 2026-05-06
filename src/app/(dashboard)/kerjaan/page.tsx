import { prisma } from "@/lib/prisma";
import ProjectClient from "./ProjectClient";

export const dynamic = "force-dynamic";

export default async function KerjaanPage() {
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    }),
    prisma.client.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manajemen Kerjaan</h1>
      </div>
      <ProjectClient initialProjects={projects} clients={clients} />
    </div>
  );
}
