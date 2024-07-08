"use client";
import { DayClosingInitData } from "@/app/(root)/new-daily/page";
import { newClosingSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import DeleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import SaveIcon from "@material-symbols/svg-400/outlined/save.svg";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ReactSelect from "react-select";
import { z } from "zod";
import LoadingAnimation from "../LoadingAnimation";

type CountType = Prisma.SaleResourceCreateArgs["data"]["countType"];

const resourceRecords = newClosingSchema.shape.items.element
  .omit({ obtainedCount: true, returnedCount: true })
  .array();

type ResourceRecords = z.infer<typeof resourceRecords>;

const countTypeResolver = (type: CountType | null) => {
  switch (type) {
    case "BUNCH":
      return "svazků";
    case "KILOGRAM":
      return "kilogramů";
    case "PIECE":
      return "kusů";
  }
};

export default function NewDailyClosing({
  initData,
}: {
  initData: {
    day: NonNullable<DayClosingInitData["day"]>;
    allSellers: DayClosingInitData["allSellers"];
  };
}) {
  const [availableResources, setAvailableResources] = useState<
    Omit<ResourceRecords[0], "resourceId">[] | null
  >(null);
  const [itemIndexForModal, setItemIndexForModal] = useState<number | null>(
    null
  );
  const [updateStatus, setUpdateStatus] = useState<
    "inProgress" | "finished" | "failed"
  >("finished");
  const [prevValues, setPrevValues] = useState<z.infer<
    typeof newClosingSchema
  > | null>(
    initData.day?.items
      ? {
          items: initData.day.items.map((item) => ({
            ...item,
            name: item.resource.name,
            countType: item.resource.countType,
            resourceId: item.resource.id,
          })),
        }
      : null
  );
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const {
    handleSubmit,
    control,
    register,
    formState,
    setValue,
    watch,
    getValues,
  } = useForm<z.infer<typeof newClosingSchema>>({
    resolver: zodResolver(newClosingSchema),
    mode: "onBlur",
    defaultValues:
      {
        items: initData.day?.items.map((item) => ({
          ...item,
          name: item.resource.name,
          countType: item.resource.countType,
          resourceId: item.resource.id,
        })),
      } ?? [],
  });

  const items = watch("items");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    axios
      .get("/api/sale-items")
      .then((res) =>
        resourceRecords.element
          .omit({ resourceId: true })
          .array()
          .safeParseAsync(res.data)
      )
      .then((parseRes) => {
        if (parseRes.success) return setAvailableResources(parseRes.data);
        throw Error(parseRes.error.message);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const cleanedItems = { items: items.filter((i) => i.name !== "") };
    if (
      cleanedItems.items.length === 0 ||
      !formState.isValid ||
      formState.isValidating ||
      updateStatus === "inProgress"
    )
      return;
    setUpdateStatus("inProgress");
    axios
      .put(`/api/closing/${initData.day.id}`, cleanedItems)
      .then(() => setUpdateStatus("finished"))
      .catch(() => setUpdateStatus("failed"));
  }, [items, formState.isValid]);

  return (
    <>
      <dialog ref={modalRef} className="modal">
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
                onClick={() =>
                  itemIndexForModal !== null && remove(itemIndexForModal)
                }
              >
                Ano
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="flex justify-center">
        {availableResources ? (
          <form
            onSubmit={handleSubmit(() => {})}
            className="container flex flex-col mt-12 gap-y-6 items-center"
          >
            {fields.map((item, index) => (
              <section
                key={item.id}
                className="flex gap-4 items-center border p-2 rounded-md w-max [&_span]:font-semibold 
                [&>label>input]:w-44 [&>label>input]:input [&>label>input]:input-bordered [&>label>input]:h-[2.4rem] [&>label>input]:rounded-md"
              >
                <label>
                  <div className="label">
                    <span className="label-text">Položka</span>
                  </div>
                  <ReactSelect
                    className="w-64"
                    getOptionLabel={(d) => d.name}
                    placeholder="Vybrat..."
                    noOptionsMessage={() => "Žádné možnosti k výběru"}
                    isSearchable={true}
                    options={availableResources}
                    value={{
                      id: watch(`items.${index}.id`),
                      name: watch(`items.${index}.name`),
                      countType: watch(`items.${index}.countType`),
                    }}
                    onChange={(val) => {
                      if (val) {
                        setValue(`items.${index}.id`, val.id);
                        setValue(`items.${index}.name`, val.name);
                        setValue(`items.${index}.countType`, val.countType);
                      }
                    }}
                  />
                </label>

                <label>
                  <div className="label">
                    <span className="label-text">
                      Naskladněno{" "}
                      {countTypeResolver(watch(`items.${index}.countType`))}
                    </span>
                  </div>

                  <input
                    type="number"
                    min={0}
                    className=""
                    {...register(`items.${index}.obtainedCount`, {
                      valueAsNumber: true,
                    })}
                  />
                </label>

                <label>
                  <div className="label">
                    <span className="label-text">
                      Vráceno{" "}
                      {countTypeResolver(watch(`items.${index}.countType`))}
                    </span>
                  </div>

                  <input
                    type="number"
                    min={0}
                    className=""
                    {...register(`items.${index}.returnedCount`, {
                      valueAsNumber: true,
                    })}
                  />
                </label>

                <div className="divider divider-horizontal mx-0 ml-3" />

                <button
                  onClick={() => {
                    setItemIndexForModal(index);
                    modalRef.current?.showModal();
                  }}
                >
                  <DeleteIcon
                    style={{
                      width: "3rem",
                      height: "3rem",
                      marginRight: "1rem",
                      fill: "var(--fallback-er,oklch(var(--er)/1))",
                    }}
                  />
                </button>
              </section>
            ))}
            {formState.errors.items && (
              <p className="font-semibold text-xl text-error">
                {
                  (Object.entries(formState.errors.items[0]!)[0][1] as any)
                    .message
                }
              </p>
            )}
            <button
              className="btn btn-success w-72"
              onClick={() =>
                append({
                  id: 0,
                  name: "",
                  obtainedCount: 0,
                  returnedCount: 0,
                  countType: null,
                  resourceId: 0,
                })
              }
            >
              <AddIcon style={{ width: "2rem", height: "2rem" }} />
              Přidat položku
            </button>
            <div className="flex items-center border  rounded-md border-success p-2 text-success">
              {updateStatus === "finished" ? (
                <>
                  <SaveIcon />
                  <p>Průběžně uloženo</p>
                </>
              ) : updateStatus === "inProgress" ? (
                <>
                  <span className="loading loading-bars loading-md" />
                  Ukládám
                </>
              ) : (
                <>Nastala chyba při ukládání</>
              )}
            </div>
            <button type="submit" className="btn btn-outline">
              Uzavřít den
            </button>
          </form>
        ) : (
          <LoadingAnimation />
        )}
      </div>
    </>
  );
}
