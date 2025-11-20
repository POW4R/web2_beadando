import { prisma } from "~/lib/prisma.server";
import type { Result } from "@prisma/client";

export class ResultRepository {
  async findAll() {
    return await prisma.result.findMany({
      include: {
        driver: true,
        gp: true,
      },
      orderBy: {
        gpDate: "desc",
      },
    });
  }

  async findByDriver(driverId: number) {
    return await prisma.result.findMany({
      where: { driverId },
      include: {
        gp: true,
      },
      orderBy: {
        gpDate: "desc",
      },
    });
  }

  async findByGP(gpDate: Date) {
    return await prisma.result.findMany({
      where: { gpDate },
      include: {
        driver: true,
      },
      orderBy: {
        position: "asc",
      },
    });
  }
}

export const resultRepository = new ResultRepository();
