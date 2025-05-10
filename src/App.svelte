<script lang="ts">
    import CharacterCreation from "./lib/CharacterCreation.svelte";
    import IntentSelection from "./lib/IntentSelection.svelte";
    import Story from "./lib/Story.svelte";
    import Loading from "./lib/Loading.svelte";
    import D20Roll from "./lib/D20Roll.svelte";
    import { data, setup } from "./lib/core.svelte";
</script>

<main
    class="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4 flex flex-col max-h-full gap-4 py-4"
>
    <div
        class="transition-all relative min-h-96 h-max grow text-justify w-full border border-stone-600 rounded-lg p-4 shadow-md shadow-black/50 bg-[#FCF5E5] overflow-y-scroll"
        class:pointer-events-none={data.pending}
    >
        {#if data.choiceRoll && !data.choiceRoll.isSeen}
            <D20Roll roll={data.choiceRoll} />
        {:else if data.pending}
            <Loading />
        {:else if data.chapter}
            <Story chapter={data.chapter} />
        {:else if !setup.chars.length}
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
