"use client";

import { signIn } from "next-auth/react";
import { pbkdf2 } from "pbkdf2";
import { useState } from "react";

export default function LoginButton() {
  const [hashConversion, setHashConversion] = useState<string | null>(null);
  const [showHashConverter, setShowHashConverter] = useState<Boolean>(false);
  const [passwordHolder, setPasswordHolder] = useState<string>("");

  return (
    <div className="flex flex-col gap-y-3 items-center mt-8">
      <div className="text-3xl font-bold">
        Vítejte v Uzávěrkách<span className="text-emerald-700">Online</span>
      </div>
      <span className="font-semibold">Pro pokračování se prosím přihlaste</span>
      <button
        className="btn bg-green-700 text-base-100 text-xl mt-6"
        onClick={() => signIn()}
      >
        Přihlásit se
      </button>

      <button
        className="btn btn-outlined mt-8"
        onClick={() => setShowHashConverter((v) => !v)}
      >
        {showHashConverter ? "Skrýt" : "Zobrazit"} převaděč hesla
      </button>
      {showHashConverter && (
        <>
          <span className="font-semibold mt-3">
            Převaděč hesla (pro první použití)
          </span>
          <input
            type="password"
            className="input input-bordered"
            value={passwordHolder}
            onChange={(v) => setPasswordHolder(v.target.value)}
          />
          <button
            className="btn btn-outline"
            disabled={!passwordHolder}
            onClick={() =>
              passwordHolder &&
              pbkdf2(
                passwordHolder,
                passwordHolder.slice(0, Math.floor(passwordHolder.length / 2)),
                10000,
                64,
                "sha512",
                (err, derivedKey) => {
                  if (err) return console.error(err);

                  setHashConversion(derivedKey.toString("hex"));
                }
              )
            }
          >
            Převést
          </button>
          {hashConversion && <p className="text-black">{hashConversion}</p>}
        </>
      )}
    </div>
  );
}
