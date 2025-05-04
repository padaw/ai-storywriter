<script lang="ts">
    import PlayButton from "./components/PlayButton.svelte";
    import { Game, intents, type Intent } from "./core.svelte";
    import boatImg from "../../assets/boat.webp";
    import ChoiceButton from "./components/ChoiceButton.svelte";

    let chosenIntent = $state<Intent>(intents[0]);
    let boatName = $state<string>("");

    function next() {
        if (boatName === "") {
            alert("Please name your boat.");
            return;
        }
        const game = Game.get();
        game.intent = chosenIntent;
        game.boat = boatName;

        game.continue();
    }
</script>

<h1 class="font-bold text-xl text-center leading-10">2/3: Name Your Boat</h1>
<div
    class="relative w-full min-h-36 aspect-[4/1] bg-center border border-slate-800"
    style={`background-image: url("${boatImg}");`}
>
    <input
        type="text"
        class="text-lg absolute bottom-0 left-0 leading-8 w-full bg-gray-100/90 text-center rounded-sm py-1 px-2 text-black outline-none focus:bg-white/90"
        onchange={(el) => {
            boatName = el.currentTarget.value;
        }}
        placeholder="Your Boat's Name"
    />
</div>
<h1 class="font-bold text-xl text-center leading-10">
    3/3: Choose Your Travel Intent
</h1>
<div class="text-start flex flex-col gap-1">
    {#each intents as intent, i}
        <ChoiceButton
            num={i + 1}
            active={chosenIntent === intent}
            action={() => {
                chosenIntent = intent;
            }}>{intent}</ChoiceButton
        >
    {/each}
</div>
<div class="text-center">
    <PlayButton action={next} text="START" />
</div>
