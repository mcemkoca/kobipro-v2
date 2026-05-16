"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: customers };
  } catch (error) {
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
    return { success: false, error: "Müşteri güncellenirken hata oluştu" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Müşteri silinirken hata oluştu" };
  }
}
