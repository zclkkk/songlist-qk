export const watchChange = <T>(getter: () => T, onChange: (value: T) => void) => {
  let last: T | undefined;
  $effect(() => {
    const value = getter();
    if (value !== last) {
      last = value;
      onChange(value);
    }
  });
};
