import prisma from "@/utils/db";
import { newDaySchema } from "@/utils/schemas";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const parseRes = await newDaySchema.safeParseAsync(await req.json());
  if (!parseRes.success)
    return new NextResponse(
      "Přijatý požadavek nemá validní data: " + parseRes.error.message,
      { status: 404 }
    );
  const dbRes = await prisma.daySaleRecord
    .create({
      data: {
        seller: {
          connect: {
            name: parseRes.data.seller,
          },
        },
        date: parseRes.data.date,
      },
      include: {
        items: {
          include: { resource: true },
        },
        seller: true,
      },
    })
    .catch((err) => String(err));
  if (typeof dbRes === "string")
    return new NextResponse(dbRes, { status: 404 });
  return NextResponse.json(dbRes);
};
