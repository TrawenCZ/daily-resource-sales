"use client";

import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import HistoryIcon from "@material-symbols/svg-400/outlined/history.svg";
import HomeIcon from "@material-symbols/svg-400/outlined/home.svg";
import InvertoryIcon from "@material-symbols/svg-400/outlined/inventory.svg";
import ManageUsersIcon from "@material-symbols/svg-400/outlined/manage_accounts.svg";
import MenuIcon from "@material-symbols/svg-400/outlined/menu.svg";
import classNames from "classnames";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import UserBadge from "../UserBadge";

export default function Bottombar() {
  const route = usePathname();
  const session = useSession();

  const drawerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (drawerRef.current?.checked) drawerRef.current?.click();
  }, [route]);

  return (
    <>
      <div className="drawer drawer-end z-20">
        <input
          id="my-drawer-4"
          type="checkbox"
          className="drawer-toggle"
          ref={drawerRef}
        />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 [&>li]:font-semibold [&>li]:mt-2">
            <li className="flex flex-row items-center border-2 p-2 rounded-md">
              <UserBadge />
              <span className="text-2xl font-bold">
                {session.data?.user?.name}
              </span>
            </li>
            <li>
              <Link href="/history?p=0">
                <HistoryIcon />
                Historie uzávěrek
              </Link>
            </li>
            <li>
              <Link href="/products">
                <InvertoryIcon />
                Spravovat produkty
              </Link>
            </li>
            <li>
              <Link href="/users">
                <ManageUsersIcon />
                Spravovat uživatele
              </Link>
            </li>
            <button
              className="btn mt-auto ml-auto w-28 btn-error"
              onClick={() => signOut()}
            >
              Odhlásit se
            </button>
          </ul>
        </div>
      </div>
      <div className="btm-nav lg:hidden [&>a]:py-1 shadow-2xl [--tw-shadow:0_100px_10px_100px_rgb(0_0_0_/_0.25)] z-10">
        <Link href="/" className={classNames({ active: route === "/" })}>
          <HomeIcon />
          <span>Domů</span>
        </Link>

        <Link
          href="/new-daily"
          className={classNames({ active: route === "/new-daily" })}
        >
          <AddIcon />
          Nová uzávěrka
        </Link>

        <label htmlFor="my-drawer-4" className="">
          <MenuIcon />
          Více
        </label>
      </div>
    </>
  );
}
