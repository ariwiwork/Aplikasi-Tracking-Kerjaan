import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.expense.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();

  // Create Projects (Kerjaan)
  const statuses = ["Progress", "Selesai", "Belum Selesai"];
  const payments = ["Bank", "E Wallet", "Belum Bayar"];
  const projects = [];

  for (let i = 1; i <= 15; i++) {
    const isThisMonth = i % 2 !== 0;
    const date = new Date();
    if (!isThisMonth) {
      date.setMonth(date.getMonth() - 1); // Last month
    }
    date.setDate(Math.floor(Math.random() * 28) + 1);

    projects.push({
      projectName: `Project Dummy ${i}`,
      duration: `${(Math.floor(Math.random() * 12) + 1) * 10} Menit`,
      startDate: date,
      endDate: date,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      price: (Math.floor(Math.random() * 20) + 1) * 50000, // 50k to 1M
      paymentStatus: payments[Math.floor(Math.random() * payments.length)],
      linkUrl: `https://example.com/project${i}`,
      notes: `Catatan untuk project ${i}`,
    });
  }

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }

  // Create Expenses (Keuangan)
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(Math.floor(Math.random() * 28) + 1);
    
    await prisma.expense.create({
      data: {
        amount: (Math.floor(Math.random() * 10) + 1) * 20000,
        description: `Pengeluaran Operasional ${i}`,
        date: date
      }
    });
  }

  console.log("Dummy data created!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
