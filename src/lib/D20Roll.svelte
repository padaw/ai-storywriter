<script lang="ts">
    import { Game, type RollResult } from "./core.svelte";
    import rollImg from "../../assets/roll.webp";
    import ProgressIndicator from "./components/ProgressIndicator.svelte";
    import PlayButton from "./components/PlayButton.svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let { roll } = $props<{ roll: RollResult }>();

    let pending = $state(true);

    function next() {
        Game.get().choiceRoll = undefined;
    }

    onMount(() => {
        setTimeout(() => {
            pending = false;
        }, 2000);
    });
</script>

<div
    class="z-40 absolute top-0 left-0 h-full w-full flex flex-col justify-between"
    in:fade
    out:fade
    class:invisible={!roll}
>
    <div
        class="transition-all w-full text-lg leading-10 text-center"
        class:text-gray-600={!pending}
    >
        {pending ? "Need" : "Needed"} to roll
        <b
            class="font-mono"
            class:text-red-600={!pending && !roll.success}
            class:text-lime-600={!pending && roll.success}>{roll.required}</b
        >/20
    </div>
    <div
        class="transition-all grow py-10 w-full flex flex-col gap-4 justify-center items-center"
    >
        {#if pending}
            <img src={rollImg} alt="dice roll" class="max-w-40 max-h-40" />
        {:else}
            <div
                class="font-black text-3xl"
                class:success={!pending && roll.success}
                class:failure={!pending && !roll.success}
            >
                {roll.success ? "SUCCESS!" : "FAIL!"}
            </div>
            <div class="text-xl">
                Rolled <b class="font-mono">{roll.roll}</b>
            </div>
            <PlayButton action={next} text="CONTINUE" />
        {/if}
    </div>
    <div
        class="transition-all bg-black/10 leading-10 text-lg w-full text-center"
        class:opacity-0={pending}
    >
        Current progress: <ProgressIndicator />
        {#if roll.progressDiff}(<span
                class="font-mono"
                class:text-lime-800={roll.success}
                class:text-red-800={!roll.success}
                >{roll.progressDiff < 0
                    ? roll.progressDiff
                    : `+${roll.progressDiff}`}</span
            >){/if}
    </div>
</div>

<style>
    .success {
        @apply text-lime-600;
    }
    .failure {
        @apply text-red-600;
    }
</style>
