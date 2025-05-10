<script lang="ts">
    import { NUM_CHAPTERS } from "../config";
    import ChoiceButton from "./components/ChoiceButton.svelte";
    import PlayButton from "./components/PlayButton.svelte";
    import ProgressIndicator from "./components/ProgressIndicator.svelte";
    import { advance, data, type Chapter, type Choice } from "./core.svelte";

    let { chapter } = $props<{ chapter: Chapter }>();

    let chosenChoice = $state<Choice | undefined>();

    function next() {
        if (!chosenChoice) {
            alert("Please make a choice.");
            return;
        }
        advance(chosenChoice);
    }

    $effect(() => {
        if (chapter.choices?.length && chosenChoice === undefined) {
            chosenChoice = chapter.choices[0];
        }
    });
</script>

<div class="flex flex-col gap-2">
    <div class="font-mono flex justify-between -mt-2 -mx-2 text-sm">
        <b>Chapter {data.chapterNum}/{NUM_CHAPTERS}</b>
        {#if data.intentRoll}
            <div>
                Rolled <b
                    class="font-mono"
                    class:text-red-700={!data.intentRoll.success}
                    class:text-lime-700={data.intentRoll.success}
                    >{data.intentRoll.roll}</b
                >/20
                <span class="text-xs"
                    >needed <b>{data.intentRoll.required}</b>
                    ({data.progress}%)</span
                >
            </div>
        {:else if data.chapterNum > 1}
            <div>
                Current Progress: <ProgressIndicator />
            </div>
        {/if}
    </div>
    <h1 class="font-bold text-xl leading-10 text-center">{chapter.title}</h1>
    <p>
        {@html chapter.body}
    </p>
    {#if chapter.choices}
        <div class="flex flex-col gap-1 my-2">
            {#if data.chapterNum === 1}
                <p class="text-sm text-gray-700 font-italic text-center mb-2">
                    Choices with a <b class="text-red-700">risk level</b> cause
                    a dice roll, and you lose half its
                    <b class="text-lime-700">progress reward</b> from your total
                    progress if you fail.
                </p>
            {/if}
            {#each chapter.choices as choice, i}
                <ChoiceButton
                    fullsize
                    num={i + 1}
                    active={chosenChoice === choice}
                    action={() => {
                        chosenChoice = choice;
                    }}
                >
                    <div class="flex gap-2">
                        <div class="grow">{@html choice.text}</div>
                        {#if choice.risk || choice.progress}
                            <div class="flex gap-1 shrink-0">
                                <div
                                    class="font-mono text-lime-700"
                                    class:font-bold={choice.progress >= 30}
                                >
                                    {choice.progress}%
                                </div>
                                <div
                                    class="font-mono text-red-700"
                                    class:font-bold={choice.risk >= 30}
                                >
                                    {choice.risk}%
                                </div>
                            </div>
                        {/if}
                    </div>
                </ChoiceButton>
            {/each}
        </div>
        <div class="text-center">
            <PlayButton text="CONTINUE" action={next} />
        </div>
    {:else}
        <h1 class="font-bold text-lg leading-8 text-center">THE END</h1>
    {/if}
</div>
