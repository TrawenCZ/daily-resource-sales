import prisma from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async () =>
  await NextResponse.json(
    await prisma.saleResource.findMany().then((data) =>
      data.map((item) => ({
        itemId: item.id,
        itemName: item.name,
        countType: item.countType,
      }))
    )
  );
