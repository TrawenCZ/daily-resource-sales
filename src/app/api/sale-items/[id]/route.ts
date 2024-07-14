import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  _: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) => {
  const resourceToDelete = await prisma.saleResource.findUnique({
    where: { id: +id, deleted: false },
  });
  if (!resourceToDelete)
    return new NextResponse("Produkt ke smázání neexistuje.", { status: 404 });
  const dbRes = await prisma.saleResource.update({
    where: { id: +id },
    data: { deleted: true, name: `${resourceToDelete.name} (smazáno)` },
  });
  return new NextResponse(`Položka s ID '${id}' smazána.`);
};
