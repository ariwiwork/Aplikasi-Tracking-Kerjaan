"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(data: any) {
  await prisma.client.create({
    data: {
      name: data.name,
      // @ts-ignore
      socialMedia: data.socialMedia,
      // @ts-ignore
      followers: data.followers,
      isActive: data.isActive === "true" || data.isActive === true,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    }
  });
  revalidatePath("/client");
  revalidatePath("/");
}

export async function updateClient(id: number, data: any) {
  await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      // @ts-ignore
      socialMedia: data.socialMedia,
      // @ts-ignore
      followers: data.followers,
      isActive: data.isActive === "true" || data.isActive === true,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    }
  });
  revalidatePath("/client");
  revalidatePath("/");
}

export async function deleteClient(id: number) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/client");
  revalidatePath("/");
}
