"use client";
import { DayClosingInitData } from "@/app/(root)/new-daily/page";
import { newClosingSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@material-symbols/svg-400/outlined/add.svg";
import CheckIcon from "@material-symbols/svg-400/outlined/check_circle.svg";
import CreditCardIcon from "@material-symbols/svg-400/outlined/credit_card.svg";
import DeleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import CoinIcon from "@material-symbols/svg-400/outlined/paid.svg";
import PaymentIcon from "@material-symbols/svg-400/outlined/payments.svg";
import SaveIcon from "@material-symbols/svg-400/outlined/save.svg";
import CartIcon from "@material-symbols/svg-400/outlined/shopping_cart.svg";
import StoreIcon from "@material-symbols/svg-400/outlined/storefront.svg";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
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

  const [currPrice, setCurrPrice] = useState<number>(0);

  const removeItemModalRef = useRef<HTMLDialogElement | null>(null);
  const saveDayRef = useRef<HTMLDialogElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();

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
      cardIncome: initData.day.cardIncome,
      cashIncome: initData.day.cashIncome,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const formSubscription = useWatch({ control: control });
  const itemsSubscription = useWatch({ control: control, name: "items" });

  useEffect(() => {
    if (saveStatus === "saving") {
      const cleanedData = {
        ...formSubscription,
        items: formSubscription.items?.filter(
          (i) => i.resource && i.resource.name !== ""
        ),
      };

      axios
        .put(`/api/closing/${initData.day.id}`, cleanedData)
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
  }, [getValues, setValue]);

  useEffect(() => {
    setSaveStatus((st) => (st === "freshlySaved" ? "saved" : "unsaved"));
  }, [formSubscription]);

  const onSubmit: Parameters<typeof handleSubmit>[0] = async (data) => {
    const finalData = { ...data, archived: true };
    try {
      const res = await axios.put(`/api/closing/${initData.day.id}`, finalData);
      router.push("/?state=saved");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setCurrPrice(
      itemsSubscription.reduce(
        (acc, val) =>
          acc +
          (val.obtainedCount - val.returnedCount) * val.resource.pricePerOne,
        0
      )
    );
  }, [itemsSubscription]);

  const currIncome = watch("cardIncome") + watch("cashIncome");

  return (
    <>
      <dialog ref={removeItemModalRef} className="modal">
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

      <dialog ref={saveDayRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            <h3 className="font-bold text-lg">
              Opravdu chcete uložit a uzavřít celý den?
            </h3>
            <div className="flex gap-4 mt-4 justify-end">
              <button className="btn btn-outline w-20">Ne</button>
              <button
                className="btn btn-success w-32"
                onClick={() => {
                  if (submitButtonRef.current) {
                    submitButtonRef.current.click();
                  }
                }}
              >
                Ano
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="h-0 sticky top-24">
        <div className="relative left-8 p-6 shadow-md w-max flex flex-col items-center">
          <div className="w-max h-max flex gap-3 items-center ">
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
                  className="btn btn-outline animate-[wiggle_5s_ease-in-out_infinite] --[animation-delay:2s]"
                  onClick={() => setSaveStatus("saving")}
                  disabled={
                    !formState.isValid ||
                    formSubscription.items?.some(
                      (i) => i.resource?.name === ""
                    ) ||
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
          <div className="divider my-2" />
          <div className="flex flex-col">
            <div className="stat">
              <div className="stat-figure text-primary">
                <CartIcon />
              </div>
              <div className="stat-title">Cena celkem</div>
              <div className="stat-value text-primary">{currPrice} CZK</div>
              {/* <div className="stat-desc">21% more than last month</div> */}
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <PaymentIcon />
              </div>
              <div className="stat-title">Příjem</div>
              <div className="stat-value text-secondary">{currIncome} CZK</div>
              {/* <div className="stat-desc">21% more than last month</div> */}
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <StoreIcon />
              </div>
              <div className="stat-title">Bilance</div>
              <div className="stat-value text-accent">
                {getValues("cardIncome") + getValues("cashIncome") - currPrice}{" "}
                CZK
              </div>
              {/* <div className="stat-desc">21% more than last month</div> */}
            </div>
          </div>
          <div className="divider my-2" />
          <div className="flex flex-col items-center rounded-lg">
            <p className="font-semibold opacity-70">Zodpovědná osoba</p>
            <p className="font-bold text-2xl mt-1">
              {initData.day.seller.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-12 mt-8">
        <h1 className="font-bold text-3xl shadow-md p-6 rounded-lg">
          Uzávěrka pro den{" "}
          <span className="text-green-700">
            {initData.day.date.toLocaleDateString()}
          </span>
        </h1>
        {availableResources ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
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
                    isMulti={false}
                    value={{
                      id: watch(`items.${index}.resource.id`),
                      name: watch(`items.${index}.resource.name`),
                      countType: watch(`items.${index}.resource.countType`),
                      pricePerOne: watch(`items.${index}.resource.pricePerOne`),
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
                          `items.${index}.resource.pricePerOne`,
                          val.pricePerOne,
                          {
                            shouldTouch: true,
                          }
                        );
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
                  type="button"
                  onClick={() => {
                    setItemIndexForModal(index);
                    removeItemModalRef.current?.showModal();
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
              type="button"
              className="btn btn-success w-72"
              onClick={() =>
                append({
                  id: null,
                  obtainedCount: 0,
                  returnedCount: 0,
                  resource: {
                    id: 0,
                    name: "",
                    pricePerOne: 0,
                    countType: null,
                  },
                })
              }
            >
              <AddIcon style={{ width: "2rem", height: "2rem" }} />
              Přidat položku
            </button>
            <div className="divider w-[35rem] self-center my-1" />
            <div className="flex gap-4">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text flex">Příjem kartou</span>
                  <span className="label-text-alt">
                    <CreditCardIcon
                      style={{ height: "1.5rem", width: "1.5rem" }}
                    />
                  </span>
                </div>
                <input
                  type="number"
                  className="input input-bordered"
                  {...register("cardIncome", { valueAsNumber: true })}
                />
              </label>

              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Příjem v hotovosti</span>
                  <span className="label-text-alt">
                    <CoinIcon style={{ height: "1.5rem", width: "1.5rem" }} />
                  </span>
                </div>
                <input
                  type="number"
                  className="input input-bordered"
                  {...register("cashIncome", { valueAsNumber: true })}
                />
              </label>
            </div>
            <div className="flex flex-col items-center gap-6 shadow-md px-8 py-4 rounded-md">
              <h2 className="font-semibold text-2xl">
                Hotovo? Uložte a uzavřete celý den:
              </h2>
              <button
                type="button"
                className="btn btn-outline w-2/3"
                disabled={formState.isSubmitting}
                onClick={() => saveDayRef.current?.showModal()}
              >
                Uzavřít den
              </button>
              <button type="submit" ref={submitButtonRef} />
            </div>
          </form>
        ) : (
          <LoadingAnimation />
        )}
      </div>
    </>
  );
}
