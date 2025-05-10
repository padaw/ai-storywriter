<script module lang="ts">
    const traitIconsDict = {
        Brave: braveIcon,
        Calm: calmIcon,
        Charming: charmingIcon,
        Genius: geniusIcon,
    };

    const genderIconsDict = {
        male: maleIcon,
        female: femaleIcon,
        "non-binary": nonbinaryIcon,
    };

    const genderColorsDict: Record<Gender, ButtonColor> = {
        male: "blue",
        female: "pink",
        "non-binary": "purple",
    };
</script>

<script lang="ts">
    import maleIcon from "../../assets/male.webp";
    import femaleIcon from "../../assets/female.webp";
    import nonbinaryIcon from "../../assets/non-binary.webp";
    import braveIcon from "../../assets/brave.webp";
    import calmIcon from "../../assets/calm.webp";
    import charmingIcon from "../../assets/charming.webp";
    import geniusIcon from "../../assets/genius.webp";
    import IconButton, {
        type ButtonColor,
    } from "./components/IconButton.svelte";
    import {
        type Character,
        type Gender,
        genders,
        setup,
        traits,
    } from "./core.svelte";
    import PlayButton from "./components/PlayButton.svelte";

    let creations = $state<Character[]>([
        { name: "", gender: genders[0], trait: traits[0] },
        { name: "", gender: genders[0], trait: traits[0] },
    ]);

    function next() {
        if (creations.find((el) => el.name === "")) {
            alert("Please write all travelers' names.");
            return;
        }
        setup.chars = creations;
    }

    function handlePlayerCountChange(
        e: Event & {
            currentTarget: EventTarget & HTMLSelectElement;
        },
    ) {
        creations = [creations[0], creations[1]];
        const count = Number(e.currentTarget.value);
        if (count > 2) {
            for (let i = 2; i < count; i++) {
                creations.push({
                    name: "",
                    gender: genders[0],
                    trait: traits[0],
                });
            }
        }
    }
</script>

<h1 class="font-bold text-xl text-center leading-10">
    1/3: Create Your Characters
</h1>

<div class="text-center font-mono text-sm">
    Play with <select
        class="text-black p-1 bg-gray-200 border border-slate-800 rounded-sm outline-none focus:bg-white focus:border-slate-950"
        onchange={handlePlayerCountChange}
    >
        {#each [2, 3] as count}
            <option value={count} selected={creations.length === count}
                >{count} people</option
            >
        {/each}
    </select>
</div>

{#each creations as _, i}
    <div
        class="relative flex flex-col gap-2 border border-zinc-600 rounded-lg p-2 pt-6 mt-4 shadow-md shadow-zinc-400"
    >
        <div
            class="absolute -top-4 w-full text-center text-lg leading-8 font-bold"
        >
            <div class="bg-[#FCF5E5] px-1 inline-block">
                Traveler {i + 1}
            </div>
        </div>
        <div class="flex items-center gap-1">
            <input
                type="text"
                class="leading-8 w-full bg-gray-200 border border-slate-800 rounded-sm py-1 px-2 text-black outline-none focus:bg-white focus:border-slate-950"
                onchange={(el) => {
                    creations[i].name = el.currentTarget.value;
                }}
                placeholder="Name"
            />
            <div class="flex gap-[1px]">
                {#each genders as gender}
                    <div class="w-[42px]">
                        <IconButton
                            label={gender}
                            img={genderIconsDict[gender]}
                            color={genderColorsDict[gender]}
                            action={() => {
                                creations[i].gender = gender;
                            }}
                            active={creations[i].gender === gender}
                        />
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex gap-1 justify-center">
            {#each traits as trait}
                <div class="w-auto lg:w-20">
                    <IconButton
                        color="stone"
                        action={() => {
                            creations[i].trait = trait;
                        }}
                        active={trait === creations[i].trait}
                        label={trait}
                        img={traitIconsDict[trait]}
                        text={trait}
                    />
                </div>
            {/each}
        </div>
    </div>
{/each}

<div class="text-center">
    <PlayButton action={next} text="NEXT" />
</div>
