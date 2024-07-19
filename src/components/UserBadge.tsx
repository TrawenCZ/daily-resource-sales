import ManageUsersIcon from "@material-symbols/svg-400/outlined/manage_accounts.svg";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import LoadingAnimation from "./LoadingAnimation";

export default function UserBadge() {
  const session = useSession();

  switch (session.status) {
    case "loading":
      return <LoadingAnimation />;
    case "authenticated":
      return (
        <>
          <div className="dropdown dropdown-end">
            <div className="avatar placeholder">
              <div
                tabIndex={0}
                role="button"
                className="bg-neutral text-neutral-content w-12 rounded-full ring-green-700 ring-offset-base-100 ring ring-offset-2"
              >
                <span>
                  {session.data.user?.name
                    .split(" ")
                    .map((char) => char.at(0)?.toUpperCase())}
                </span>
              </div>
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content hidden lg:block menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow mt-2 gap-y-3"
            >
              <div className="text-center font-bold text-2xl mt-3 flex flex-col">
                {session.data.user?.name}
                {session.data.user?.isSuperAdmin && (
                  <span className="opacity-60 text-sm ">admin</span>
                )}
              </div>
              <div className="divider my-0 w-3/4 self-center" />
              {session.data.user?.isSuperAdmin && (
                <li>
                  <Link href="/users" className="font-semibold">
                    <ManageUsersIcon />
                    Spravovat uživatele
                  </Link>
                </li>
              )}
              <li>
                <button className="btn btn-error" onClick={() => signOut()}>
                  Odhlásit se
                </button>
              </li>
            </ul>
          </div>
        </>
      );
  }
}
