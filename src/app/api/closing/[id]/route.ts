import prisma from "@/utils/db";
import { newClosingSchema } from "@/utils/schemas";
import { NextRequest, NextResponse } from "next/server";

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
  const dbRes = await prisma.daySaleRecord.update({
    where: { id: +params.id },
    data: {
      items: {
        update: parseRes.data.items.map((item) => ({
          where: { id: item.id },
          data: item,
        })),
        create: parseRes.data.items.map((item) => ({
          resource: { connect: { id: item.resourceId } },
          obtainedCount: item.obtainedCount,
          returnedCount: item.returnedCount,
        })),
      },
    },
  });
  return new NextResponse("saved");
};
