<script lang="ts">
    import { getLetter } from "../game.svelte";

    let { action, idx } = $props<{
        action: Function;
        idx: number;
    }>();
</script>

<button
    onclick={action}
    class:purple={idx === 0}
    class:blue={idx === 1}
    class:rose={idx > 1}
    style="text-shadow: 1px 1px 1px #000; transition-duration: 50ms;"
    >{getLetter(idx)}</button
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
