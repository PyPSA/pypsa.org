<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { mdiIconName } from "$lib/icons/sprite";

  let className: string = "";
  export { className as class };
  export let path: string;
  export let size: string = "24";

  $: name = mdiIconName(path);
</script>

{#if name}
  <Icon {name} width={size} height={size} class={className} />
{:else}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    class={className}
  >
    <path d={path} fill="currentColor" />
  </svg>
{/if}
