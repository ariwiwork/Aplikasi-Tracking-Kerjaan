import { prisma } from "@/lib/prisma";
import ClientClient from "./ClientClient";

export const dynamic = "force-dynamic";

export default async function ClientPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manajemen Client</h1>
      </div>
      <ClientClient initialClients={clients} />
    </div>
  );
}
