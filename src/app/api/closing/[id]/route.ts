import prisma from "@/utils/db";
import { newClosingSchema } from "@/utils/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const parseRes = await z
    .object({ itemId: z.number() })
    .safeParseAsync(await req.json());
  if (!parseRes.success)
    return new NextResponse(
      "Nevalidní tělo požadavku smazání: " + parseRes.error.message,
      { status: 404 }
    );
  if (!(await prisma.daySaleRecord.findUnique({ where: { id: +params.id } })))
    return new NextResponse("Požadovaný záznam dne neexistuje.", {
      status: 404,
    });
  const dbRes = await prisma.daySaleRecord.update({
    where: { id: +params.id },
    data: {
      items: {
        delete: { id: parseRes.data.itemId },
      },
    },
  });
  if (!dbRes)
    return new NextResponse("Záznam nemohl být odstraněn.", { status: 404 });
  return new NextResponse(`Záznam s ID '${parseRes.data.itemId}' smazán.`);
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const parseRes = await newClosingSchema.safeParseAsync(await req.json());
  if (!parseRes.success)
    return new NextResponse(
      "Přijatý požadavek nemá validní data: " + parseRes.error.message,
      { status: 404 }
    );
  const dayExists = await prisma.daySaleRecord
    .findUnique({ where: { id: +params.id } })
    .then((res) => Boolean(res));
  if (!dayExists)
    return new NextResponse("Den, na který požadavek odkazuje, neexistuje", {
      status: 404,
    });
  // console.log("DATA:" + parseRes.data);
  const dbRes = await prisma.daySaleRecord.update({
    where: { id: +params.id },
    data: {
      items: {
        update: parseRes.data.items
          .filter((i) => i.id !== null)
          .map((item) => ({
            where: { id: item.id as number },
            data: {
              ...item,
              id: undefined,
              resource: { connect: { id: item.resource.id } },
            },
          })),
        create: parseRes.data.items
          .filter((i) => i.id === null)
          .map((item) => ({
            resource: { connect: { id: item.resource.id } },
            obtainedCount: item.obtainedCount,
            returnedCount: item.returnedCount,
          })),
      },
    },
    include: { items: { select: { id: true } } },
  });
  return NextResponse.json(dbRes.items);
};
