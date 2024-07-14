import { authOptions } from "@/auth";
import prisma from "@/utils/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  _: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) => {
  if (!(await getServerSession(authOptions))?.user?.isSuperAdmin)
    return new NextResponse(
      "Uživatel nemá dostatečná práva k mazání ostatních uživatelů.",
      { status: 403 }
    );

  const userToDelete = await prisma.salePerson.findUnique({
    where: { id: +id, deleted: false },
  });
  if (!userToDelete)
    return new NextResponse("Uživatel ke smázání neexistuje.", { status: 404 });
  const dbRes = await prisma.salePerson.update({
    where: { id: +id },
    data: { deleted: true, name: `${userToDelete.name} (smazán)` },
  });
  return new NextResponse(`Uživatel s ID '${id}' smazán.`);
};
