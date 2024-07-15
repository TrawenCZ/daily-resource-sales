import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync } from "pbkdf2";
import { exit } from "process";
const prisma = new PrismaClient();

const hashPasswordSync = (pw: string) =>
  pbkdf2Sync(
    pw,
    pw.slice(0, Math.floor(pw.length / 2)),
    10000,
    64,
    "sha512"
  ).toString("hex");

const superadminUsername = process.env.SUPERADMIN_USERNAME;
const superadminPassword = process.env.SUPERADMIN_PASSWORD;

if (!superadminUsername || !superadminPassword) {
  console.error("Přihlašovací údaje pro Superadmina nenastaveny! Zastavuji...");
  exit(1);
}

const main = async () => {
  const superAdmin = await prisma.salePerson.upsert({
    where: { name: superadminUsername },
    update: {
      passwordHash: hashPasswordSync(superadminPassword),
      isSuperAdmin: true,
    },
    create: {
      name: superadminUsername,
      passwordHash: hashPasswordSync(superadminPassword),
      isSuperAdmin: true,
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    exit(1);
  });
