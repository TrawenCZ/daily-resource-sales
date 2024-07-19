"use client";

import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import HistoryIcon from "@material-symbols/svg-400/outlined/history.svg";
import InvertoryIcon from "@material-symbols/svg-400/outlined/inventory.svg";
import Link from "next/link";
import UserBadge from "../UserBadge";

export default function Topbar() {
  return (
    <div className="hidden lg:flex navbar bg-base-200 h-16 shadow-md z-10 sticky top-0 justify-between px-4">
      <div className="flex gap-4">
        <Link href="/" className="text-xl font-bold flex mx-4">
          Uzávěrky<span className="text-emerald-700">Online</span>
        </Link>
        <div className="flex gap-4 py-2 [&>a]:btn [&>a]:btn-outline [&_svg]:h-8 [&_svg]:w-8">
          <Link href="/new-daily" className="btn-success">
            <AddIcon />
            Nová denní uzávěrka
          </Link>
          <Link href="/history?p=0">
            <HistoryIcon />
            Historie uzávěrek
          </Link>
        </div>
      </div>
      <div className="flex gap-4">
        <Link href="/products" className="btn btn-outline flex">
          <InvertoryIcon style={{ height: "70%" }} />
          Spravovat produkty
        </Link>
        <UserBadge />
      </div>
    </div>
  );
}
