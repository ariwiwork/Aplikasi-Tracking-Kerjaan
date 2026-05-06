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
      // @ts-ignore
      initialFollowers: data.initialFollowers,
      isActive: data.isActive === "true" || data.isActive === true,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      // @ts-ignore
      leftAt: data.leftAt ? new Date(data.leftAt) : null,
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
      // @ts-ignore
      initialFollowers: data.initialFollowers,
      isActive: data.isActive === "true" || data.isActive === true,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      // @ts-ignore
      leftAt: data.leftAt ? new Date(data.leftAt) : null,
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
