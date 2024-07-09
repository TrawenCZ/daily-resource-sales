export const compareArrays = (a1: any[], a2: any[]) => {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
};

export const containsUndefinedFields = (
  o: Record<string, any> | any[] | unknown
): boolean => {
  if (o === undefined || o === null) return true;
  if (Array.isArray(o)) {
    if (o.some((v) => containsUndefinedFields(v))) return true;
  } else if (typeof o === "object") {
    if (Object.values(o).some((v) => containsUndefinedFields(v))) return true;
  }
  return false;
};
