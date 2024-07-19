"use client";

import LoadingAnimation from "@/components/LoadingAnimation";
import { dailyClosingSchema } from "@/utils/schemas";
import CoinIcon from "@material-symbols/svg-400/outlined/paid.svg";
import PaymentIcon from "@material-symbols/svg-400/outlined/payments.svg";
import PersonIcon from "@material-symbols/svg-400/outlined/person.svg";
import CartIcon from "@material-symbols/svg-400/outlined/shopping_cart.svg";
import StoreIcon from "@material-symbols/svg-400/outlined/storefront.svg";
import axios from "axios";
import { useEffect, useState } from "react";
import { z } from "zod";

const singleClosingRecordSchema = dailyClosingSchema.omit({ allSellers: true })
  .shape.day._def.options[0];

export default function SingleClosingRecordPage({
  params,
}: {
  params: { id: string };
}) {
  const [info, setInfo] = useState<z.infer<
    typeof singleClosingRecordSchema
  > | null>(null);

  const [itemPrices, setItemPrices] = useState<{
    total: number;
    individualPrices: number[];
  } | null>(null);

  useEffect(() => {
    axios
      .get(`/api/closing/${params.id}`)
      .then((res) => singleClosingRecordSchema.safeParseAsync(res.data))
      .then((parseRes) => {
        if (parseRes.success) {
          let totalSum = 0;
          const prices = parseRes.data.items.map((i) => {
            const currPrice =
              i.pricePerOne * (i.obtainedCount - i.returnedCount);
            totalSum += currPrice;
            return currPrice;
          });
          setItemPrices({ total: totalSum, individualPrices: prices });
          return setInfo(parseRes.data);
        }
        throw Error(parseRes.error.message);
      })
      .catch((err) => console.error(err));
  }, [params.id]);

  if (!info || !itemPrices) return <LoadingAnimation />;

  return (
    <>
      <div className="flex flex-col items-center m-8 gap-y-6">
        <div className="overflow-x-auto container">
          <h1 className="text-3xl font-semibold text-center mb-4">
            Uzávěrka ze dne{" "}
            <span className="font-bold text-green-700">
              {info.date.toLocaleDateString()}
            </span>
          </h1>
          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th />
                <th>Položka</th>
                <th>Cena za jednotku</th>
                <th>Počet naskladněných jednotek</th>
                <th>Počet vrácených jednotek</th>
                <th>Cena</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {info.items.map((item, index) => (
                <tr key={item.id}>
                  <th />
                  <th>{item.resource.name}</th>
                  <td>{item.pricePerOne}</td>
                  <td>{item.obtainedCount}</td>
                  <td>{item.returnedCount}</td>
                  <td>
                    <span className="font-bold">
                      {itemPrices.individualPrices[index]}{" "}
                    </span>
                    CZK
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <CartIcon />
            </div>
            <div className="stat-title">Cena celkem</div>
            <div className="stat-value text-primary">
              {itemPrices.total} CZK
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary"></div>
            <div className="stat-title">Příjem</div>
            <div className="flex flex-col gap-2 [&>div>div>div>svg]:h-6 [&>div]:items-center">
              {" "}
              <div className="flex gap-4 justify-center mt-2">
                <div className="flex flex-col font-semibold text-success items-center">
                  <div className="flex items-center">
                    <PaymentIcon />
                    Karta
                  </div>
                  <div className="stat-value text-success">
                    {info.cardIncome} CZK
                  </div>
                </div>
                <div className="divider divider-horizontal mx-0" />
                <div className="flex flex-col font-semibold text-secondary items-center">
                  <div className="flex items-center">
                    <CoinIcon />
                    Hotovost{" "}
                  </div>
                  <div className="stat-value text-secondary">
                    {info.cashIncome} CZK
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <StoreIcon />
            </div>
            <div className="stat-title">Bilance</div>
            <div className="stat-value text-secondary">
              {info.cardIncome + info.cashIncome - itemPrices.total} CZK
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure opacity-80">
              <PersonIcon />
            </div>
            <div className="stat-title">Zodpovědná osoba</div>
            <div className="stat-value opacity-80">{info.seller.name} </div>
          </div>
        </div>
      </div>
    </>
  );
}
