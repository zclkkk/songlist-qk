<script lang="ts">
  import { Select } from 'bits-ui';

  type SelectItem = {
    value: string;
    label: string;
    disabled?: boolean;
  };

  type Props = {
    value?: string;
    items: SelectItem[];
    placeholder?: string;
    triggerClass?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
  };

  let {
    value = $bindable(),
    items,
    placeholder = '请选择',
    triggerClass = 'form-field',
    name,
    required,
    disabled
  }: Props = $props();

  const selectedLabel = $derived(items.find((item) => item.value === value)?.label ?? '');
</script>

<Select.Root type="single" bind:value={value as never} {items} {name} {required} {disabled}>
  <Select.Trigger class="{triggerClass} select-trigger" aria-label={placeholder}>
    <span class="select-value" data-placeholder={!selectedLabel ? '' : undefined}>
      {selectedLabel || placeholder}
    </span>
    <svg
      class="select-chevron"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </Select.Trigger>
  <Select.Portal>
    <Select.Content class="select-content" sideOffset={6}>
      {#each items as { value: optValue, label, disabled } (optValue)}
        <Select.Item value={optValue} {label} {disabled} class="select-item">
          {#snippet children({ selected })}
            <span class="select-item-label">{label}</span>
            {#if selected}
              <svg
                class="select-item-check"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            {/if}
          {/snippet}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Portal>
</Select.Root>
