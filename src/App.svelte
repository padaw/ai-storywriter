<script lang="ts">
    import { Game } from "./lib/core.svelte";
    import CharacterCreation from "./lib/CharacterCreation.svelte";
    import IntentSelection from "./lib/IntentSelection.svelte";
    import Story from "./lib/Story.svelte";
    import Loading from "./lib/Loading.svelte";
    import D20Roll from "./lib/D20Roll.svelte";

    const game = Game.get();
</script>

<main
    class="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4 flex flex-col max-h-full gap-4 py-4"
>
    <div
        class="transition-all relative min-h-96 h-max grow text-justify w-full border border-stone-600 rounded-lg p-4 shadow-md shadow-black/50 bg-[#FCF5E5] overflow-y-scroll"
        class:pointer-events-none={game.pending && !game.choiceRoll}
    >
        {#if game.choiceRoll}
            <D20Roll roll={game.choiceRoll} />
        {:else if game.pending}
            <Loading />
        {:else if game.passage}
            <Story />
        {:else if !game.chars.length}
            <div class="w-full flex flex-col gap-4">
                <CharacterCreation />
            </div>
        {:else}
            <div class="w-full flex flex-col gap-4">
                <IntentSelection />
            </div>
        {/if}
    </div>
</main>
