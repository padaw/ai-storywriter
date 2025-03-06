<script lang="ts">
    import ChoiceButton from "./lib/ChoiceButton.svelte";
    import { Game } from "./Game.svelte";
    import { onMount } from "svelte";

    const game = new Game();
    const names = ["A", "B", "C"];
    const colors = ["blue", "rose", "purple"] as const;

    let container: HTMLDivElement;

    onMount(() => {
        game.container = container;
    });
</script>

<main
    class="w-full md:w-4/5 lg:w-2/3 xl:w-1/2 2xl:w-1/3 flex flex-col max-h-full gap-4 py-4"
>
    <div
        bind:this={container}
        class="grow text-justify w-full border border-stone-600 rounded-lg p-4 shadow-md shadow-black/50 bg-[#FCF5E5] overflow-y-scroll"
    >
        <h1 class="font-bold text-xl leading-10">The Mysterious Letter</h1>
        <div class="flex flex-col gap-2">
            {#each game.lines as line}
                {#if "question" in line}
                    <div class="text-center gap-1 flex flex-col">
                        <b class="text-stone-500">{line.question}</b>
                        <span class="text-lime-700 italic">{line.answer}</span>
                    </div>
                {:else}
                    <p>{line.text}</p>
                {/if}
            {/each}
            {#if game.finished}
                <div class="text-center text-xl-leading-10 font-bold">
                    THE END
                </div>
            {:else if game.pending}
                <p class="text-center font-bold">...</p>
            {:else}
                <u class="font-bold">{game.question}</u>
                <div class="flex flex-col gap-1">
                    {#each game.choices as choice, i}
                        <div><b>{names[i]})</b> <span>{choice}</span></div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
    {#if !game.finished && !game.pending}
        <div class="shrink-0 flex w-full gap-1">
            {#each game.choices as _, i}
                <ChoiceButton
                    action={() => game.makeChoice(i)}
                    color={colors[i]}>{names[i]}</ChoiceButton
                >
            {/each}
        </div>
    {/if}
</main>

<style>
</style>
