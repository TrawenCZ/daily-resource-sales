"use client";
import NewDailyClosing from "@/components/form/NewDailyClosing";
import LoadingAnimation from "@/components/LoadingAnimation";
import {
  dailyClosingSchema,
  type DayClosingInitData,
  newDaySchema,
} from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import NewDayIcon from "@material-symbols/svg-400/outlined/add_box.svg";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReactSelect from "react-select";

export default function NewDailyPage() {
  const [currentDayClosing, setCurrentDayClosing] = useState<
    DayClosingInitData | "loading" | null
  >(null);

  const { register, handleSubmit, getValues, setValue } = useForm({
    mode: "onBlur",
    resolver: zodResolver(newDaySchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      seller: "",
    },
  });

  useEffect(() => {
    if (!currentDayClosing) {
      axios
        .get("/api/last-closing")
        .then((res) => dailyClosingSchema.safeParseAsync(res.data))
        .then((parseRes) => {
          if (parseRes.success) return setCurrentDayClosing(parseRes.data);
          throw Error(parseRes.error?.message);
        })
        .catch((err) => console.error(err));
    }
  });

  const onSubmit = async (data: { date: string; seller: string }) => {
    try {
      const response = await axios
        .post("/api/closing", data)
        .then((res) => dailyClosingSchema.shape.day.safeParseAsync(res.data))
        .then((parseRes) => {
          if (parseRes.success) return parseRes.data;
          throw Error(parseRes.error.message);
        });
      setCurrentDayClosing({
        allSellers: (currentDayClosing as DayClosingInitData).allSellers,
        day: response,
      });
    } catch (e) {
      console.error("onSubmit: " + e);
    }
  };

  if (!currentDayClosing || currentDayClosing === "loading")
    return (
      <div className="flex justify-center w-full">
        <LoadingAnimation />
      </div>
    );

  if (!currentDayClosing.day || currentDayClosing.day.archived) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-max border-2 border-info-content rounded-md flex flex-col items-center mt-8 p-4 gap-y-4">
          <h2 className="font-bold text-4xl">Žádný aktivní záznam</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center gap-4"
          >
            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Datum</span>
              </div>
              <input
                type="date"
                className="input input-bordered"
                {...register("date", { valueAsDate: true })}
              />
            </label>

            <ReactSelect
              options={currentDayClosing.allSellers}
              getOptionLabel={(v) => v.name}
              isSearchable={true}
              onChange={(val) => {
                if (!val) return;
                setValue("seller", val.name);
              }}
            />

            <button
              className="btn btn-success font-bold text-xl flex-col h-28"
              type="submit"
            >
              <NewDayIcon />
              Začít nový den
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <NewDailyClosing
      initData={
        currentDayClosing as {
          day: NonNullable<DayClosingInitData["day"]>;
          allSellers: DayClosingInitData["allSellers"];
        }
      }
    />
  );
}
