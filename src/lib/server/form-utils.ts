export const readText = (value: FormDataEntryValue | null) =>
  typeof value === 'string' ? value : '';

export const parseEnum = <T extends string>(value: string, options: readonly T[], label: string): T => {
  if (options.includes(value as T)) return value as T;
  throw new Error(`Invalid ${label}: ${value}`);
};
