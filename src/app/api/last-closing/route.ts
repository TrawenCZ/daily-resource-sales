import prisma from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const lastSaleRecord = await prisma.daySaleRecord.findMany({
    where: { archived: false },
    orderBy: {
      date: "desc",
    },
    take: 1,
    include: {
      items: {
        include: { resource: true },
      },
      seller: true,
    },
  });

  const allSellers = await prisma.salePerson.findMany({
    where: { deleted: false },
  });
  if (allSellers.length === 0)
    return new NextResponse("V systému musí být alespoň jedna osoba.", {
      status: 404,
    });
  return NextResponse.json({ day: lastSaleRecord.at(0) ?? null, allSellers });
};
