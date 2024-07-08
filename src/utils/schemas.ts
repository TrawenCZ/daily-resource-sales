import { z } from "zod";

export const newDaySchema = z.object({
  seller: z.string().min(1),
  date: z.coerce.date(),
});

export const newClosingSchema = z.object({
  items: z
    .object({
      id: z.number().min(0),
      name: z.string(),
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
      resourceId: z.number(),
    })
    .array(),
});
