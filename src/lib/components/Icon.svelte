<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { icons } from "$lib/icons/sprite";

  const {
    name,
    class: className,
    width,
    height,
    ...rest
  }: { name: string } & SVGAttributes<SVGSVGElement> = $props();

  const def = $derived.by(() => {
    const found = icons[name];
    if (!found) throw new Error(`Unknown icon: ${name}`);
    return found;
  });
</script>

<svg
  viewBox={def.viewBox}
  width={width ?? def.size}
  height={height ?? def.size}
  aria-hidden={def.hidden ? "true" : undefined}
  class={className}
  {...rest}
>
  <use href="#i-{name}" />
</svg>
