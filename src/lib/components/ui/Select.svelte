<script lang="ts">
  import Icon from '$lib/components/ui/Icon.svelte';
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
    <Icon name="chevron-down" class="select-chevron" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content class="select-content" sideOffset={6}>
      {#each items as { value: optValue, label, disabled } (optValue)}
        <Select.Item value={optValue} {label} {disabled} class="select-item">
          {#snippet children({ selected })}
            <span class="select-item-label">{label}</span>
            {#if selected}
              <Icon name="check" class="select-item-check" />
            {/if}
          {/snippet}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Portal>
</Select.Root>
