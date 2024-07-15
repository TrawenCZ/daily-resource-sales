import { pbkdf2Sync } from "pbkdf2";

export const hashPasswordSync = (pw: string) =>
  pbkdf2Sync(
    pw,
    pw.slice(0, Math.floor(pw.length / 2)),
    10000,
    64,
    "sha512"
  ).toString("hex");
