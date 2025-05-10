import {
    makeChapterPrompt,
    makeEndingPrompt,
    makeIntroPrompt,
    systemPrompt,
} from "../prompts";
import { GoogleGenAI } from "@google/genai";
import { wait } from "./utils";
import {
    API_KEY,
    MODEL_NAME,
    NUM_CHAPTERS,
    REQUEST_WAIT_TIME,
} from "../config";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const genders = ["male", "female", "non-binary"] as const;
export const traits = ["Brave", "Calm", "Charming", "Genius"] as const;
export const intents = [
    "To enjoy a sightseeing tour of the Pacific Ocean",
    "To explore a newly discovered island",
    "To deliver emergency supplies to a remote village",
    "To document rare sea creatures for a research project",
    "To find a rumored shipwreck filled with treasure",
] as const;

export let setup = $state<StorySetup>({
    intent: intents[0],
    boatName: "",
    chars: [],
});

export let data = $state<StoryData>({
    pending: false,
    progress: 0,
    chapterNum: 0,
    chapter: null,
    pastChapters: [],
    pastChoices: [],
    intentRoll: null,
    choiceRoll: null,
});

export async function advance(choice?: Choice) {
    const nextChapterNum = data.chapterNum + 1;

    if (!choice && nextChapterNum > 1) {
        alert("Please make a choice.");
        return;
    }

    data.pending = true;

    let prompt: string;
    if (!choice) {
        prompt = makeIntroPrompt();
    } else {
        const croll = roll(100 - choice.risk);
        const diff = croll.success ? choice.progress : choice.progress / -2;
        data.choiceRoll = { ...croll, isSeen: false, progressDiff: diff };
        data.progress += diff;

        const choiceProper: PastChoice = {
            body: choice.text,
            success: croll.success,
        };
        data.pastChoices.push(choiceProper);

        if (nextChapterNum < NUM_CHAPTERS) {
            prompt = makeChapterPrompt(nextChapterNum, choiceProper);
        } else {
            data.intentRoll = roll(data.progress);
            prompt = makeEndingPrompt(choiceProper);
        }
    }

    const response: AI_RESPONSE = await request(prompt);

    console.log("PROMPT", prompt);
    console.log("RESPONSE", response);

    data.chapter = {
        title: response.title,
        body: response.body,
    };

    if ("choices" in response) {
        data.chapter.choices = response.choices;
        data.pastChapters.push(response.summary);
    }

    data.chapterNum = nextChapterNum;

    data.pending = false;
}

async function request(prompt: string): Promise<AI_RESPONSE> {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            systemInstruction: systemPrompt,
        },
    });
    if (!response.text) {
        console.error("NO RESPONSE TEXT", response);
        return wait(() => request(prompt), REQUEST_WAIT_TIME);
    }
    const aiJson = response.text.slice(8, -4).replaceAll("\n", "");
    let aiResponse: AI_RESPONSE;
    try {
        aiResponse = JSON.parse(aiJson);
    } catch (_) {
        console.error("COULD NOT PARSE AI RESPONSE", response.text, aiJson);
        return wait(() => request(prompt), REQUEST_WAIT_TIME);
    }
    return aiResponse;
}

function roll(chance: number): RollResult {
    const risk = 100 - chance;
    const min = Math.min(20, 1 + Math.ceil(risk / 5));
    const num = Math.ceil(Math.random() * 20);
    return { success: num >= min, required: min, roll: num };
}

type AI_RESPONSE = AI_CHAPTER | AI_ENDING;

type AI_CHAPTER = {
    title: string;
    body: string;
    summary: string;
    choices: Choice[];
};

type AI_ENDING = {
    title: string;
    body: string;
};

export interface StorySetup {
    boatName: string;
    chars: Character[];
    intent: Intent;
}

export interface StoryData {
    pending: boolean;
    progress: number;
    chapterNum: number;
    chapter: Chapter | null;
    pastChapters: string[];
    pastChoices: PastChoice[];
    choiceRoll: ChoiceRollResult | null;
    intentRoll: RollResult | null;
}

export interface Chapter {
    title: string;
    body: string;
    choices?: Choice[];
}

export interface PastChoice {
    body: string;
    success: boolean;
}

export interface RollResult {
    success: boolean;
    roll: number;
    required: number;
}

export interface ChoiceRollResult extends RollResult {
    isSeen: boolean;
    progressDiff: number;
}

export interface Choice {
    text: string;
    progress: number;
    risk: number;
}

export interface Character {
    name: string;
    gender: Gender;
    trait: Trait;
}

export type Gender = (typeof genders)[number];
export type Trait = (typeof traits)[number];
export type Intent = (typeof intents)[number];
