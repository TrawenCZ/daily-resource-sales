"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import DeleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ReactSelect from "react-select";
import { z } from "zod";
import LoadingAnimation from "../LoadingAnimation";

type CountType = Prisma.SaleResourceCreateArgs["data"]["countType"];

const validationSchema = z.object({
  items: z
    .object({
      itemId: z.number().min(0),
      itemName: z.string(),
      obtainedCount: z
        .number({
          invalid_type_error: "Uvedená hodnota pro 'Naskladněno' není číslo",
        })
        .min(0, "Uvedená hodnota pro 'Naskladněno' musí být větší než 0"),
      returnedCount: z
        .number({
          invalid_type_error: "Uvedená hodnota pro 'Vráceno' není číslo",
        })
        .min(0, "Uvedená hodnota pro 'Vráceno' musí být větší než 0"),
      countType: z.enum(["PIECE", "KILOGRAM", "BUNCH"]).or(z.null()),
    })
    .array(),
});

const resourceRecords = validationSchema.shape.items.element
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

export default function NewDailyClosing() {
  const [availableResources, setAvailableResources] =
    useState<ResourceRecords | null>(null);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [itemIndexForModal, setItemIndexForModal] = useState<number | null>(
    null
  );

  const { handleSubmit, control, register, formState, setValue, watch } =
    useForm<z.infer<typeof validationSchema>>({
      resolver: zodResolver(validationSchema),
      mode: "onBlur",
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    axios
      .get("/api/sale-items")
      .then((res) => resourceRecords.parseAsync(res.data))
      .then((resources) => setAvailableResources(resources))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (formState.isValidating || !formState.isValid) return;
  }, [formState.isValidating, formState.isValid]);

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
                    getOptionLabel={(d) => d.itemName}
                    placeholder="Vybrat..."
                    noOptionsMessage={() => "Žádné možnosti k výběru"}
                    isSearchable={true}
                    options={availableResources}
                    value={{
                      itemId: watch(`items.${index}.itemId`),
                      itemName: watch(`items.${index}.itemName`),
                      countType: watch(`items.${index}.countType`),
                    }}
                    onChange={(val) => {
                      if (val) {
                        setValue(`items.${index}.itemId`, val.itemId);
                        setValue(`items.${index}.itemName`, val.itemName);
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
                  itemId: 0,
                  itemName: "",
                  obtainedCount: 0,
                  returnedCount: 0,
                  countType: null,
                })
              }
            >
              <AddIcon style={{ width: "2rem", height: "2rem" }} />
              Přidat položku
            </button>
            <button type="submit" className="btn btn-outline">
              Uložit
            </button>
          </form>
        ) : (
          <LoadingAnimation />
        )}
      </div>
    </>
  );
}
