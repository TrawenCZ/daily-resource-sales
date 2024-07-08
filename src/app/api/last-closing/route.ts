import prisma from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  const lastSaleRecord = await prisma.daySaleRecord.findMany({
    orderBy: {
      date: "asc",
    },
    take: 1,
    include: {
      items: {
        include: { resource: true },
      },
      seller: true,
    },
  });

  const allSellers = await prisma.salePerson.findMany();
  if (allSellers.length === 0)
    return NextResponse.json({
      success: false,
      error: "V systému musí být alespoň jedna osoba.",
    });
  return NextResponse.json({ day: lastSaleRecord.at(0) ?? null, allSellers });
};
