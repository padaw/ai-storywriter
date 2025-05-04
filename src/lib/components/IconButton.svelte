<script module lang="ts">
    export type ButtonColor = "blue" | "pink" | "purple" | "stone";
</script>

<script lang="ts">
    let { color, img, label, action, active, text } = $props<{
        color: ButtonColor;
        img: string;
        label: string;
        action: Function;
        active?: boolean;
        text?: string;
    }>();
</script>

<button
    aria-label={label}
    class="w-half aspect-square rounded-sm border border-stone-400 p-2 transition-colors relative"
    class:blue={color === "blue"}
    class:pink={color === "pink"}
    class:purple={color === "purple"}
    class:stone={color === "stone"}
    class:active
    onclick={action}
>
    <img src={img} alt="icon" class="w-full h-full" />
    {#if text}
        <div
            class="absolute bottom-0 left-0 w-full text-xs bg-black/60 text-white font-bold"
            style="text-shadow: 1px 1px 2px #000"
        >
            {text}
        </div>
    {/if}
</button>

<style>
    .active {
        @apply border-2;
    }
    .active div {
        @apply bg-black/80;
    }
    .blue {
        @apply bg-blue-200;
    }
    .blue.active {
        @apply border-blue-700 bg-blue-300;
    }
    .stone {
        @apply bg-stone-200;
    }
    .stone.active {
        @apply border-stone-700 bg-stone-300;
    }
    .pink {
        @apply bg-pink-200;
    }
    .pink.active {
        @apply border-pink-700 bg-pink-300;
    }
    .purple {
        @apply bg-purple-200;
    }
    .purple.active {
        @apply border-purple-700 bg-purple-300;
    }
</style>
