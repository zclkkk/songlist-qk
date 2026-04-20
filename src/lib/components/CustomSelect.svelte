<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';

  let { 
    value = $bindable(), 
    options, 
    placeholder = '请选择',
    name,
    variant = 'default'
  } = $props<{
    value: string;
    options: { label: string; value: string }[];
    placeholder?: string;
    name?: string;
    variant?: 'default' | 'muted';
  }>();

  let isOpen = $state(false);
  let selectContainer: HTMLDivElement;

  function toggleOpen() {
    isOpen = !isOpen;
  }

  function selectOption(optionValue: string) {
    value = optionValue;
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (selectContainer && !selectContainer.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);
</script>

<div class="relative w-full" bind:this={selectContainer}>
  <button
    type="button"
    class={`flex w-full items-center justify-between text-left transition-all ${variant === 'muted' ? 'form-field-muted' : 'form-field'} ${isOpen ? '!border-[#5e6ad2] !shadow-[0_0_0_4px_rgba(94,106,210,0.15)] bg-white' : ''}`}
    onclick={toggleOpen}
  >
    <span class="block truncate">
      {selectedLabel}
    </span>
    <svg
      class="h-4 w-4 text-[#8a8f98] transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clip-rule="evenodd"
      />
    </svg>
  </button>

  {#if name}
    <input type="hidden" {name} {value} />
  {/if}

  {#if isOpen}
    <div
      transition:slide={{ duration: 150 }}
      class="absolute z-50 mt-2 w-full overflow-hidden rounded-[18px] border border-[#e6e6e6] bg-white py-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]"
    >
      <ul class="max-h-60 overflow-auto py-0.5 no-scrollbar">
        {#each options as option}
          <li>
            <button
              type="button"
              class="flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-[#f5f6f7] {value === option.value ? 'bg-[#5e6ad2]/5 text-[#5e6ad2] font-medium' : 'text-[#62666d]'}"
              onclick={() => selectOption(option.value)}
            >
              <span class="truncate">{option.label}</span>
              {#if value === option.value}
                <svg class="ml-auto h-[18px] w-[18px] flex-shrink-0 text-[#5e6ad2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                </svg>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
