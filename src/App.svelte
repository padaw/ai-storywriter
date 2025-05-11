<script lang="ts">
    import CharacterCreation from "./lib/CharacterCreation.svelte";
    import IntentSelection from "./lib/IntentSelection.svelte";
    import Story from "./lib/Story.svelte";
    import Loading from "./lib/Loading.svelte";
    import D20Roll from "./lib/D20Roll.svelte";
    import { data, setup } from "./lib/core.svelte";
    import Error from "./lib/Error.svelte";
    import { onMount } from "svelte";
    import qrImg from "../assets/qr.webp";
    import { APP_URL } from "./config";

    let qrDisplay = $state(false);

    onMount(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "q" || document.activeElement !== document.body) {
                return;
            }
            qrDisplay = !qrDisplay;
        });
    });
</script>

{#if qrDisplay}
    <div
        class="absolute top-0 left-0 bg-white w-full h-full z-50 flex flex-col justify-center items-center gap-16"
    >
        <img
            src={qrImg}
            alt="qr code"
            class="min-w-80 aspect-square max-w-96 w-full border-8 border-violet-800 shadow-2xl shadow-violet-950"
        />
        <h1 class="text-black font-mono font-black text-4xl text-center">
            {APP_URL}
        </h1>
    </div>
{/if}

<main class="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4 max-h-full">
    <div
        class="transition-all relative min-h-96 h-max text-justify w-full border border-stone-600 rounded-lg p-4 shadow-md shadow-black/50 bg-[#FCF5E5] overflow-y-scroll"
    >
        {#if data.error}
            <Error error={data.error} />
        {:else if data.choiceRoll && !data.choiceRoll.isSeen}
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
