"use client";

import LoadingAnimation from "@/components/LoadingAnimation";
import { newUserSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import CheckIcon from "@material-symbols/svg-400/outlined/check.svg";
import DeleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import axios from "axios";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const usersSchema = z
  .object({ name: newUserSchema.shape.name, id: z.number() })
  .array();

export default function UserManagementPage() {
  const [users, setUsers] = useState<z.infer<typeof usersSchema> | null>(null);

  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const deleteUserModalRef = useRef<HTMLDialogElement | null>(null);

  const session = useSession();

  useEffect(() => {
    axios
      .get("/api/users")
      .then((res) => usersSchema.safeParseAsync(res.data))
      .then((parseRes) => {
        if (parseRes.success) return setUsers(parseRes.data);
        throw Error(parseRes.error.message);
      })
      .catch((err) => console.error(err));
  }, []);

  const {
    register,
    formState: { isSubmitting, isValid, errors, isSubmitSuccessful },
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    mode: "onBlur",
  });

  const onSubmit: Parameters<typeof handleSubmit>[0] = async (data) => {
    const res = await axios.post("/api/users", data);
    setUsers((us) =>
      us
        ? [...us, { id: (res.data as { id: number }).id, name: data.name }]
        : null
    );
    setTimeout(() => reset(), 3500);
  };

  return (
    <>
      <dialog ref={deleteUserModalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            <h3 className="font-bold text-lg">
              Opravdu chcete smazat tohoto uživatele?
            </h3>
            <div className="flex gap-4 mt-4 justify-end">
              <button className="btn btn-outline w-20">Ne</button>
              <button
                className="btn btn-error w-32"
                onClick={() => {
                  if (userToDeleteId !== null) {
                    axios
                      .delete(`/api/users/${userToDeleteId}`)
                      .then((res) =>
                        setUsers((us) =>
                          us ? us.filter((u) => u.id !== userToDeleteId) : null
                        )
                      )
                      .catch((err) => console.error(err));
                  }
                }}
              >
                Ano
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="flex justify-center">
        <div className="flex flex-col items-center container mt-8 gap-y-12">
          {!users ? (
            <LoadingAnimation />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra [&>th]">
                {/* head */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Jméno</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td className="font-bold">{u.name}</td>
                      <td>
                        {session.data?.user?.id !== u.id && (
                          <button
                            className="btn btn-ghost"
                            onClick={() => {
                              setUserToDeleteId(u.id);
                              deleteUserModalRef.current?.showModal();
                            }}
                          >
                            <DeleteIcon
                              style={{
                                fill: "var(--fallback-er,oklch(var(--er)/1))",
                                height: "80%",
                              }}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            className="flex flex-col gap-y-4 p-8 border rounded-md"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="font-bold text-2xl text-center">
              Přidat nového uživatele
            </h2>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Jméno</span>
              </div>
              <input
                {...register("name")}
                type="text"
                placeholder=""
                className={classNames("input input-bordered w-full max-w-xs", {
                  "!input-error": errors.name,
                })}
              />
              {errors.name?.message && (
                <p className="text-error">{errors.name.message}</p>
              )}
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Heslo</span>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder=""
                className={classNames("input input-bordered w-full max-w-xs", {
                  "!input-error": errors.password,
                })}
              />
              {errors.password?.message && (
                <p className="text-error">{errors.password.message}</p>
              )}
            </label>

            <button
              type="submit"
              className={classNames("btn  w-max", {
                "!btn-success": isSubmitSuccessful,
                "btn-outline": !isSubmitSuccessful,
              })}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <LoadingAnimation />
              ) : isSubmitSuccessful ? (
                <>
                  <CheckIcon style={{ height: "80%" }} />
                  Uživatel přidán
                </>
              ) : (
                <>
                  <AddIcon style={{ height: "80%" }} />
                  Přidat uživatele
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
