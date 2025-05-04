<script lang="ts">
    import ChoiceButton from "./components/ChoiceButton.svelte";
    import PlayButton from "./components/PlayButton.svelte";
    import ProgressIndicator from "./components/ProgressIndicator.svelte";
    import { Game, NUM_ITERATIONS, type Choice } from "./core.svelte";

    let chosenChoice = $state<Choice | undefined>();

    const game = Game.get();

    function next() {
        if (!chosenChoice) {
            alert("Please make a choice.");
            return;
        }
        game.continue(chosenChoice);
    }

    $effect(() => {
        if (game.choices.length && chosenChoice === undefined) {
            chosenChoice = game.choices[0];
        }
    });
</script>

<div class="flex flex-col gap-2">
    <div class="font-mono flex justify-between -mt-2 -mx-2 text-sm">
        <b
            >Chapter {NUM_ITERATIONS -
                game.remainingChoices -
                Number(game.pending)}/{NUM_ITERATIONS}</b
        >
        {#if game.summaries.length && game.remainingChoices}
            <div>
                Current Progress: <ProgressIndicator />
            </div>
        {:else if game.intentRoll}
            <div>
                Rolled <b class="font-mono"
                    class:text-red-700={!game.intentRoll.success}
                    class:text-lime-700={game.intentRoll.success}
                >{game.intentRoll.roll}</b>/20
                <span class="text-xs"
                    >needed <b>{game.intentRoll.required}</b> ({game.progress}%)</span
                > 
            </div>
        {/if}
    </div>
    <h1 class="font-bold text-xl leading-10 text-center">{game.title}</h1>
    <p>
        {@html game.passage}
    </p>
    {#if game.choices.length}
        <div class="flex flex-col gap-1 my-2">
            {#if !game.summaries.length}
                <p class="text-sm text-gray-700 font-italic text-center mb-2">
                    Choices with a <b class="text-red-700">risk level</b> cause
                    a dice roll, and you lose its
                    <b class="text-lime-700">progress reward</b> from your total
                    progress if you fail.
                </p>
            {/if}
            {#each game.choices as choice, i}
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
