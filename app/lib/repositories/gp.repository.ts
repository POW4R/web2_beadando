import { prisma } from "~/lib/prisma.server";
import type { GP } from "@prisma/client";

export class GPRepository {
  async findAll(): Promise<GP[]> {
    return await prisma.gP.findMany({
      orderBy: { date: "desc" },
    });
  }

  async findByDate(date: Date): Promise<GP | null> {
    return await prisma.gP.findUnique({
      where: { date },
    });
  }

  async findWithResults(date: Date) {
    return await prisma.gP.findUnique({
      where: { date },
      include: {
        results: {
          include: {
            driver: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }
}

export const gpRepository = new GPRepository();
