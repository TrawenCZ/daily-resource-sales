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
      resource: z.object({
        id: z.number(),
        name: z.string(),
        pricePerOne: z.number(),
        countType: countTypeZodEnum.or(z.null()),
      }),
    })
    .array(),
  archived: z.boolean().optional(),
  cashIncome: z.number().min(0),
  cardIncome: z.number().min(0),
});
