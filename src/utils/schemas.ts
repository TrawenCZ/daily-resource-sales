import { z } from "zod";

export const countTypeZodEnum = z.enum(["PIECE", "KILOGRAM", "BUNCH"]);

export const newDaySchema = z.object({
  seller: z.string().min(1),
  date: z.coerce.date(),
});

export const newClosingSchema = z.object({
  items: z
    .object({
      id: z.number().or(z.null()),
      pricePerOne: z
        .number()
        .min(0, "Uvedená hodnota pro 'Cenu' musí být alespoň 0"),
      obtainedCount: z
        .number({
          invalid_type_error: "Uvedená hodnota pro 'Naskladněno' není číslo",
        })
        .min(0, "Uvedená hodnota pro 'Naskladněno' musí být alespoň 0"),
      returnedCount: z
        .number({
          invalid_type_error: "Uvedená hodnota pro 'Vráceno' není číslo",
        })
        .min(0, "Uvedená hodnota pro 'Vráceno' musí být alespoň 0"),
      resource: z.object({
        id: z.number(),
        name: z.string(),
        countType: countTypeZodEnum.or(z.null()),
      }),
    })
    .refine(
      (data) => data.obtainedCount >= data.returnedCount,
      "Počet naskladnění musí být větší nebo roven počtu vrácení."
    )
    .array(),
  archived: z.boolean().optional(),
  cashIncome: z
    .number({
      invalid_type_error: "Uvedená hodnota pro 'Příjem v hotovosti' není číslo",
    })
    .min(0, "Uvedená hodnota pro 'Příjem v hotovosti' musí být alespoň 0"),
  cardIncome: z
    .number({
      invalid_type_error: "Uvedená hodnota pro 'Příjem kartou' není číslo",
    })
    .min(0, "Uvedená hodnota pro 'Příjem kartou' musí být alespoň 0"),
});
