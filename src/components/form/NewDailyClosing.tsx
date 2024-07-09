"use client";
import { DayClosingInitData } from "@/app/(root)/new-daily/page";
import { newClosingSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import CheckIcon from "@material-symbols/svg-400/outlined/check_circle.svg";
import DeleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import SaveIcon from "@material-symbols/svg-400/outlined/save.svg";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import ReactSelect from "react-select";
import { z } from "zod";
import LoadingAnimation from "../LoadingAnimation";

type CountType = Prisma.SaleResourceCreateArgs["data"]["countType"];

const resourceRecords = newClosingSchema.shape.items.element.shape.resource;

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
    ResourceRecords[] | null
  >(null);
  const [itemIndexForModal, setItemIndexForModal] = useState<number | null>(
    null
  );
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "unsaved" | "saving" | "freshlySaved"
  >("saved");

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
    defaultValues: {
      items: initData.day.items.map((item) => ({
        ...item,
        name: item.resource.name,
        countType: item.resource.countType,
        resourceId: item.resource.id,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const formSubscription = useWatch({ control: control });

  useEffect(() => {
    if (saveStatus === "saving") {
      axios
        .put(`/api/closing/${initData.day.id}`, formSubscription)
        .then((res) => {
          if (saveStatus === "saving") {
            (res.data as { id: number }[]).forEach((elem, index) => {
              if (formSubscription.items)
                setValue(`items.${index}.id`, elem.id);
            });
            setSaveStatus("freshlySaved");
          }
        })
        .catch((e) => {
          console.error(e);
          setSaveStatus("unsaved");
        });
    }
  }, [formSubscription, initData.day.id, saveStatus, setValue]);

  useEffect(() => {
    getValues("items").forEach((item, index) => {
      setValue(`items.${index}.resource`, item.resource, { shouldTouch: true });
      setValue(`items.${index}.obtainedCount`, item.obtainedCount, {
        shouldTouch: true,
      });
      setValue(`items.${index}.returnedCount`, item.returnedCount, {
        shouldTouch: true,
      });
    });
    axios
      .get("/api/sale-items")
      .then((res) => resourceRecords.array().safeParseAsync(res.data))
      .then((parseRes) => {
        if (parseRes.success) return setAvailableResources(parseRes.data);
        throw Error(parseRes.error.message);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setSaveStatus((st) => (st === "freshlySaved" ? "saved" : "unsaved"));
  }, [formSubscription]);

  console.log(
    formState.touchedFields.items + "AND IS VALID" + formState.isValid
  );
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
                onClick={() => {
                  if (itemIndexForModal !== null) {
                    axios.post(`/api/closing/${initData.day.id}`, {
                      itemId: formSubscription.items?.at(itemIndexForModal)?.id,
                    });
                    remove(itemIndexForModal);
                  }
                }}
              >
                Ano
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="sticky top-24 w-max h-max left-16 flex gap-3 items-center border-l-2 border-gray-600 pl-2">
        {saveStatus === "saved" ? (
          <>
            <div className="text-success flex gap-2 items-center">
              <CheckIcon style={{ height: "2rem", width: "2rem" }} />
              <p>Průběžně uloženo</p>
            </div>
          </>
        ) : saveStatus === "saving" ? (
          <>
            <span className="loading loading-bars loading-md" />
            Ukládám
          </>
        ) : (
          <>
            <button
              className="btn btn-outline"
              onClick={() => setSaveStatus("saving")}
              disabled={
                !formState.isValid ||
                formSubscription.items?.some((i) => i.resource?.name === "") ||
                formState.touchedFields.items?.some(
                  (i) => i && Object.keys(i).length !== 3
                )
              }
            >
              <span className="absolute flex h-5 w-5 -right-1 -top-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-500" />
              </span>
              <SaveIcon style={{ height: "2rem", width: "2rem" }} />
              Průběžně uložit
            </button>
          </>
        )}
      </div>

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
                    name={`items.${index}.resource`}
                    getOptionLabel={(d) => d.name}
                    placeholder="Vybrat..."
                    noOptionsMessage={() => "Žádné možnosti k výběru"}
                    isSearchable={true}
                    options={availableResources}
                    value={{
                      id: watch(`items.${index}.resource.id`),
                      name: watch(`items.${index}.resource.name`),
                      countType: watch(`items.${index}.resource.countType`),
                    }}
                    onChange={(val) => {
                      if (val) {
                        setValue(`items.${index}.resource.id`, val.id, {
                          shouldTouch: true,
                        });
                        setValue(`items.${index}.resource.name`, val.name, {
                          shouldTouch: true,
                        });
                        setValue(
                          `items.${index}.resource.countType`,
                          val.countType,
                          {
                            shouldTouch: true,
                          }
                        );
                      }
                    }}
                  />
                </label>

                <label>
                  <div className="label">
                    <span className="label-text">
                      Naskladněno{" "}
                      {countTypeResolver(
                        watch(`items.${index}.resource.countType`)
                      )}
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
                      {countTypeResolver(
                        watch(`items.${index}.resource.countType`)
                      )}
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
                append(
                  {
                    id: null,
                    obtainedCount: 0,
                    returnedCount: 0,
                    resource: {
                      id: 0,
                      name: "",
                      countType: null,
                    },
                  },
                  {
                    focusName: `items.${
                      formSubscription.items?.length ?? 0
                    }.resource`,
                  }
                )
              }
            >
              <AddIcon style={{ width: "2rem", height: "2rem" }} />
              Přidat položku
            </button>
            <div className="flex gap-6 ">
              <button type="submit" className="btn btn-outline">
                Uzavřít den
              </button>
            </div>
          </form>
        ) : (
          <LoadingAnimation />
        )}
      </div>
    </>
  );
}
