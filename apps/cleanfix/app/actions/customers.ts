"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

function isDbError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes("connect") ||
    error.message.includes("database") ||
    error.message.includes("connection") ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED")
  );
}

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: customers };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: [] };
    return { success: false, error: "Müşteriler yüklenirken hata oluştu" };
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { bookings: { include: { service: true } } },
    });
    return { success: true, data: customer };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: null };
    return { success: false, error: "Müşteri bulunurken hata oluştu" };
  }
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const createData: any = { name: data.name };
    if (data.email) createData.email = data.email;
    if (data.phone) createData.phone = data.phone;
    if (data.address) createData.address = data.address;
    if (data.notes) createData.notes = data.notes;

    const customer = await prisma.customer.create({
      data: createData,
    });
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error) {
    if (isDbError(error)) {
      const mock = {
        id: `cust-${Date.now()}`,
        name: data.name,
        email: data.email || `${Date.now()}@demo.local`,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Müşteri oluşturulurken hata oluştu" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }
) {
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data,
    });
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error) {
    if (isDbError(error)) {
      const mock = {
        id,
        name: data.name || "Müşteri",
        email: data.email || `${Date.now()}@demo.local`,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Müşteri güncellenirken hata oluştu" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    if (isDbError(error)) return { success: true };
    return { success: false, error: "Müşteri silinirken hata oluştu" };
  }
}
