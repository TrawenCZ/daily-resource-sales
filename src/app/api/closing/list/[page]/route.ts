import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { page: string } }
) =>
  await NextResponse.json(
    await prisma.daySaleRecord.findMany({
      where: { archived: true },
      orderBy: { date: "desc" },
      skip: +params.page,
      take: 10,
    })
  );
