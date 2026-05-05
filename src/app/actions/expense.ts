"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExpense(data: any) {
  await prisma.expense.create({
    data: {
      amount: parseFloat(data.amount) || 0,
      description: data.description,
      date: new Date(data.date),
    }
  });
  revalidatePath("/keuangan");
  revalidatePath("/");
}

export async function deleteExpense(id: number) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/keuangan");
  revalidatePath("/");
}
