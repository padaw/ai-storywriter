import {
    makeChapterPrompt,
    makeEndingPrompt,
    makeIntroPrompt,
    systemPrompt,
} from "../prompts";
import {
    NUM_CHAPTERS,
    REQUEST_NUM_TRIES,
    REQUEST_WAIT_TIME,
    SERVER_URL,
} from "../config";
import { wait } from "./utils";

const STORY_ID = Math.floor(Math.random() * 1000);

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
    error: null,
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
        data.error = "logic";
        console.error("DIDN'T MAKE A CHOICE FOR CHAPTER " + nextChapterNum);
        return;
    }

    data.pending = true;

    let prompt: string;
    if (!choice) {
        prompt = makeIntroPrompt();
    } else {
        const croll = roll(100 - choice.risk);
        let diff = croll.success ? choice.progress : choice.progress / -2;
        diff = Math.min(100 - data.progress, Math.max(-data.progress, diff));

        data.progress += diff;
        data.choiceRoll = {
            ...croll,
            isSeen: false,
            progressDiff: diff,
        };
        data.pastChoices.push({
            body: choice.text,
            success: croll.success,
        });

        if (nextChapterNum < NUM_CHAPTERS) {
            prompt = makeChapterPrompt(nextChapterNum);
        } else {
            data.intentRoll = roll(data.progress);
            prompt = makeEndingPrompt();
        }
    }

    const response: SERVER_RESPONSE = await request(prompt);

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

async function request(prompt: string, attempt = 1): Promise<SERVER_RESPONSE> {
    const codeErrorDict: Record<number, AppError> = {
        400: "logic",
        418: "api",
    };

    const body: SERVER_REQUEST = { id: STORY_ID, prompt, system: systemPrompt };
    const response = await fetch(SERVER_URL, {
        method: "POST",
        body: JSON.stringify(body),
    });

    if (response.status > 200) {
        if (attempt < REQUEST_NUM_TRIES) {
            return await wait(
                () => request(prompt, attempt + 1),
                REQUEST_WAIT_TIME,
            );
        }
        data.error = codeErrorDict[response.status] ?? "server";
        console.error("REQUEST FAILED", { request: body, response });
        throw new Error();
    }

    return await response.json();
}

function roll(chance: number): RollResult {
    const risk = 100 - chance;
    const min = Math.min(20, 1 + Math.ceil(risk / 5));
    const num = Math.ceil(Math.random() * 20);
    return { success: num >= min, required: min, roll: num };
}

type SERVER_REQUEST = {
    id: number;
    system: string;
    prompt: string;
};

type SERVER_RESPONSE = AI_CHAPTER | AI_ENDING;

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
    error: null | AppError;
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

export type AppError = "api" | "server" | "logic";
