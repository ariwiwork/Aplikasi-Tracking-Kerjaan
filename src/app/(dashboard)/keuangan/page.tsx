import { prisma } from "@/lib/prisma";
import FinanceClient from "./FinanceClient";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  const projects = await prisma.project.findMany({
    where: { paymentStatus: { in: ["Bank", "E Wallet"] } },
    orderBy: { createdAt: 'desc' }
  });

  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });

  // Combine into ledger
  const ledger = [
    ...projects.map(p => ({
      id: `p-${p.id}`,
      originalId: p.id,
      date: p.startDate, // Or endDate if preferable, but let's use startDate for simplicity
      description: `Pemasukan Project: ${p.projectName}`,
      income: p.price,
      expense: 0,
      type: "income"
    })),
    ...expenses.map(e => ({
      id: `e-${e.id}`,
      originalId: e.id,
      date: e.date,
      description: e.description,
      income: 0,
      expense: e.amount,
      type: "expense"
    }))
  ];

  // Sort by date descending
  ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Data Keuangan</h1>
      </div>
      <FinanceClient initialLedger={ledger} />
    </div>
  );
}
