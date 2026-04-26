export const readText = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const readBoolean = (value: FormDataEntryValue | null) => value === 'on';
