import prisma from "@/utils/db";
import { newResourceSchema } from "@/utils/schemas";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () =>
  await NextResponse.json(
    await prisma.saleResource.findMany({ where: { deleted: false } })
  );

export const POST = async (req: NextRequest) => {
  const parseRes = await newResourceSchema.safeParseAsync(await req.json());
  if (!parseRes.success)
    return new NextResponse("Nevalidní tělo požadavku.", { status: 404 });

  if (
    await prisma.saleResource.findUnique({
      where: { name: parseRes.data.name, deleted: false },
    })
  )
    return new NextResponse("Produkt s tímto jménem již existuje", {
      status: 404,
    });

  const dbRes = await prisma.saleResource.create({
    data: { name: parseRes.data.name, countType: parseRes.data.countType },
  });

  return NextResponse.json({ success: true, id: dbRes.id });
};
