"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(data: any) {
  await prisma.project.create({
    data: {
      projectName: data.projectName,
      duration: data.duration,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      price: parseFloat(data.price) || 0,
      paymentStatus: data.paymentStatus,
      linkUrl: data.linkUrl,
      notes: data.notes,
      fileUrl: data.fileUrl,
    }
  });
  revalidatePath("/kerjaan");
  revalidatePath("/");
}

export async function updateProject(id: number, data: any) {
  await prisma.project.update({
    where: { id },
    data: {
      projectName: data.projectName,
      duration: data.duration,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      price: parseFloat(data.price) || 0,
      paymentStatus: data.paymentStatus,
      linkUrl: data.linkUrl,
      notes: data.notes,
      fileUrl: data.fileUrl,
    }
  });
  revalidatePath("/kerjaan");
  revalidatePath("/");
}

export async function deleteProject(id: number) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/kerjaan");
  revalidatePath("/");
}
