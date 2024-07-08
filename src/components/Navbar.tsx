import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import HistoryIcon from "@material-symbols/svg-400/outlined/history.svg";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-200 h-16 shadow-md z-10 sticky top-0">
      <div className="flex gap-4">
        <Link href="/" className="text-xl font-bold flex mx-4">
          Uzávěrky<div className="text-emerald-700">Online</div>
        </Link>
        <div className="flex gap-4 py-2 [&>a]:btn [&>a]:btn-outline [&_svg]:h-8 [&_svg]:w-8">
          <Link href="/new-daily" className="btn-success">
            <AddIcon />
            Nová denní uzávěrka
          </Link>
          <Link href="/history">
            <HistoryIcon />
            Historie uzávěrek
          </Link>
        </div>
      </div>
    </div>
  );
}
