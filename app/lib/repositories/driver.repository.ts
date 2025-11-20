import { prisma } from "~/lib/prisma.server";
import type { Driver } from "@prisma/client";

export class DriverRepository {
  async findAll(): Promise<Driver[]> {
    return await prisma.driver.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id: number): Promise<Driver | null> {
    return await prisma.driver.findUnique({
      where: { id },
    });
  }

  async create(data: Omit<Driver, "id">): Promise<Driver> {
    return await prisma.driver.create({
      data,
    });
  }

  async update(id: number, data: Partial<Omit<Driver, "id">>): Promise<Driver> {
    return await prisma.driver.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Driver> {
    return await prisma.driver.delete({
      where: { id },
    });
  }

  async findWithResults(id: number) {
    return await prisma.driver.findUnique({
      where: { id },
      include: {
        results: {
          include: {
            gp: true,
          },
        },
      },
    });
  }
}

export const driverRepository = new DriverRepository();
