import { authOptions } from "@/auth";
import prisma from "@/utils/db";
import { newUserSchema } from "@/utils/schemas";
import { hashPasswordSync } from "@/utils/server-utils";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () =>
  NextResponse.json(
    await prisma.salePerson.findMany({ where: { deleted: false } })
  );

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isSuperAdmin) {
    return new NextResponse("Uživatel nemá oprávnění pro přidání uživatele.", {
      status: 403,
    });
  }

  const parseRes = await newUserSchema.safeParseAsync(await req.json());
  if (!parseRes.success) {
    return new NextResponse("Nevalidní tělo požadavku přidání.", {
      status: 404,
    });
  }

  if (
    await prisma.salePerson.findUnique({
      where: { name: parseRes.data.name, deleted: false },
    })
  ) {
    return new NextResponse("Uživatel s tímto jménem již existuje", {
      status: 404,
    });
  }
  const dbRes = await prisma.salePerson.create({
    data: {
      name: parseRes.data.name,
      passwordHash: hashPasswordSync(parseRes.data.password),
    },
  });
  return NextResponse.json({ success: true, id: dbRes.id });
};
