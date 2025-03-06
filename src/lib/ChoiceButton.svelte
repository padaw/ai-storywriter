<script lang="ts">
    import type { Snippet } from "svelte";

    let { action, color, children } = $props<{
        color: "purple" | "blue" | "rose";
        action: Function;
        children: Snippet;
    }>();
</script>

<button
    onclick={action}
    class:purple={color === "purple"}
    class:blue={color === "blue"}
    class:rose={color === "rose"}
    style="text-shadow: 1px 1px 1px #000; transition-duration: 50ms;"
    >{@render children()}</button
>

<style>
    button {
        @apply transition-all font-bold text-xl grow text-white leading-10 border rounded-sm shadow-md shadow-black/50;
    }
    button.purple {
        @apply bg-purple-600 border-purple-700 hover:bg-purple-800 hover:border-purple-500 active:bg-purple-900;
    }
    button.blue {
        @apply bg-blue-600 border-blue-700 hover:bg-blue-800 hover:border-blue-500 active:bg-blue-900;
    }
    button.rose {
        @apply bg-rose-600 border-rose-700 hover:bg-rose-800 hover:border-rose-500 active:bg-rose-900;
    }
</style>
