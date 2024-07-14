"use client";
import {
  ResourceRecords,
  resourceRecords,
} from "@/components/form/NewDailyClosing";
import LoadingAnimation from "@/components/LoadingAnimation";
import { newResourceSchema } from "@/utils/schemas";
import { countTypeResolver } from "@/utils/util";
import { zodResolver } from "@hookform/resolvers/zod";
import DeleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import axios from "axios";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function ProductManagementPage() {
  const [resources, setResources] = useState<ResourceRecords[] | null>(null);

  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const deleteResourceModalRef = useRef<HTMLDialogElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isSubmitSuccessful, errors, isValid },
  } = useForm<z.infer<typeof newResourceSchema>>({
    resolver: zodResolver(newResourceSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    axios
      .get("/api/sale-items")
      .then((res) => resourceRecords.array().safeParseAsync(res.data))
      .then((parseRes) => {
        if (parseRes.success) return setResources(parseRes.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const onSubmit: Parameters<typeof handleSubmit>[0] = async (data) => {
    const res = await axios.post("/api/sale-items", data);
    setResources((rs) =>
      rs
        ? [...rs, { id: (res.data as { id: number }).id, ...data }]
        : [{ id: (res.data as { id: number }).id, ...data }]
    );
    setTimeout(() => reset(), 3500);
  };

  return (
    <>
      <dialog ref={deleteResourceModalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            <h3 className="font-bold text-lg">
              Opravdu chcete smazat tuto položku?
            </h3>
            <div className="flex gap-4 mt-4 justify-end">
              <button className="btn btn-outline w-20">Ne</button>
              <button
                className="btn btn-error w-32"
                onClick={() => {
                  if (itemToDeleteId !== null) {
                    axios
                      .delete(`/api/sale-items/${itemToDeleteId}`)
                      .then((res) =>
                        setResources((rs) =>
                          rs ? rs.filter((r) => r.id !== itemToDeleteId) : null
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
          {!resources ? (
            <LoadingAnimation />
          ) : (
            <div className="overflow-x-auto">
              {resources.length === 0 ? (
                <p className="font-bold text-2xl">
                  Zatím žádné uložené produkty.
                </p>
              ) : (
                <table className="table table-zebra [&>th]">
                  {/* head */}
                  <thead>
                    <tr>
                      <th></th>
                      <th>Jméno</th>
                      <th>Typ počítání</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((r, i) => (
                      <>
                        <tr>
                          <td>{i + 1}</td>
                          <td className="font-bold">{r.name}</td>
                          <td>{countTypeResolver(r.countType, true)}</td>
                          <td>
                            <button
                              className="btn btn-ghost"
                              onClick={() => {
                                setItemToDeleteId(r.id);
                                deleteResourceModalRef.current?.showModal();
                              }}
                            >
                              <DeleteIcon
                                style={{
                                  fill: "var(--fallback-er,oklch(var(--er)/1))",
                                  height: "80%",
                                }}
                              />
                            </button>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4 border rounded-md p-4"
          >
            <h2 className="font-bold text-2xl text-center opacity-70">
              Přidat nový produkt
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

            <select
              {...register("countType")}
              className="select select-bordered w-full max-w-xs"
              defaultValue=""
            >
              <option disabled value="">
                Typ počítání
              </option>
              <option value="KILOGRAM">Kilogram</option>
              <option value="PIECE">Kus</option>
              <option value="BUNCH">Svazek</option>

              {errors.countType?.message && (
                <p className="text-error">{errors.countType.message}</p>
              )}
            </select>

            <button
              type="submit"
              className={classNames("btn", {
                "!btn-success": isSubmitSuccessful,
                "btn-outline": !isSubmitSuccessful,
              })}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <LoadingAnimation />
              ) : isSubmitSuccessful ? (
                <>Produkt přidán</>
              ) : (
                <>Přidat produkt</>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
