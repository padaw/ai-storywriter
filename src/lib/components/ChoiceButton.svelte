<script lang="ts">
    import type { Snippet } from "svelte";

    let { num, children, action, active, fullsize } = $props<{
        num: number;
        action: Function;
        active?: boolean;
        children: Snippet;
        fullsize?: boolean;
    }>();
</script>

<button
    class="text-start max-w-full rounded-lg px-2 py-1 leading-6 transition-all hover:bg-orange-200"
    class:w-max={!fullsize}
    onclick={action}
    class:active
>
    <div class="flex gap-1 w-full">
        <b>{num}.-</b>
        <div class="grow">
            {@render children()}
        </div>
    </div>
</button>

<style>
    .active {
        @apply text-black bg-orange-300 font-bold;
    }
    .active:hover {
        @apply bg-orange-300;
    }
</style>
