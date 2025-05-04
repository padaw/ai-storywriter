// setup a server to handle requests
// setup billing for the api

const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDLE2zK8EFkSnpmWSp6xAK2qdW2DI_Fvmw";
const WAIT_TIME = 300;

export const NUM_ITERATIONS = 5;
export const ROLL_BONUS = 3;
export const genders = ["male", "female", "non-binary"] as const;
export const traits = ["Brave", "Calm", "Charming", "Genius"] as const;
export const intents = [
    "To enjoy a sightseeing tour of the Pacific Ocean",
    "To explore a newly discovered island",
    "To deliver emergency supplies to a remote village",
    "To document rare sea creatures for a research project",
    "To find a rumored shipwreck filled with treasure",
] as const;

export class Game {
    static instance?: Game;

    pending = $state(false);
    chars = $state<Character[]>([]);
    boat = $state("");
    intent = $state<Intent>(intents[0]);
    title = $state("");
    passage = $state("");
    choices = $state<Choice[]>([]);
    summaries = $state<string[]>([]);
    progress = $state(0);
    remainingChoices = $state(NUM_ITERATIONS);
    choiceRoll = $state<RollResult | undefined>();
    intentRoll = $state<RollResult | undefined>();

    private constructor() {}

    static get(): Game {
        if (!Game.instance) {
            Game.instance = new Game();
        }
        return Game.instance;
    }

    async continue(choice?: Choice) {
        this.pending = true;
        this.remainingChoices--;

        const prompt = this.makePrompt(choice);
        const json = await this.request(prompt);

        if ("choices" in json) {
            this.choices = json.choices;
            this.summaries.push(json.summary);
        } else {
            this.choices = [];
        }

        this.title = json.title;
        this.passage = json.passage;

        this.pending = false;
    }

    private roll(percentage: number, type: "choice" | "intent"): RollResult {
        let required: number;
        if (type === "intent") {
            required = 20 - Math.ceil(percentage / 10) * 2;
        } else {
            required = Math.floor(percentage / 10) * 2;
        }
        required = Math.max(1, Math.min(20 - ROLL_BONUS, required));
        const roll = Math.max(1, Math.floor(Math.random() * 20));
        return { required, roll, success: roll >= required };
    }

    private async request(prompt: string): Promise<AI_RESPONSE> {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const json = await response.json();
        const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error(json);
            return wait(() => this.request(prompt), WAIT_TIME);
        }

        const aiJson = text.slice(8, -4).replaceAll("\n", "");
        let aiResponse: AI_RESPONSE;
        try {
            aiResponse = JSON.parse(aiJson);
        } catch (e) {
            console.error(text);
            return wait(() => this.request(prompt), WAIT_TIME);
        }

        return aiResponse;
    }

    private makePrompt(choice?: Choice) {
        let prompt = `
            ${this.chars.map((c) => `${c.name} (${c.gender})`).join(" and ")} are taking a trip to the Pacific Ocean.
            They are traveling on their own boat named ${this.boat}.
            Their intent of travel is ${this.intent}.
        `;
        if (choice) {
            prompt += `
                Their journey so far is as follows: ${this.summaries.map((t, i) => `${i + 1}) ${t}`).join(" ")}
                And they made this choice after the last chapter: '${choice.text}'.
            `;
            if (choice.risk) {
                const roll = this.roll(choice.risk, "choice");
                this.choiceRoll = roll;
                if (roll.success) {
                    this.progress += choice.progress;
                    this.choiceRoll.progressDiff = choice.progress;
                    prompt +=
                        "That was a risky choice and they managed to avoid the danger.";
                } else {
                    this.progress = Math.max(
                        0,
                        this.progress - choice.progress,
                    );
                    this.choiceRoll.progressDiff = Math.max(
                        0 - this.progress,
                        (this.progress - choice.progress) * -1,
                    );
                    prompt +=
                        "That was a risky choice and they should face the bad outcome.";
                }
            } else {
                this.choiceRoll = undefined;
            }
        }
        if (!this.remainingChoices) {
            const roll = this.roll(this.progress, "intent");
            this.intentRoll = roll;
            return (
                prompt +
                `Write a short (max 150 words) and satisfying ending to their travel. ${roll.success ? "They must accomplish their travel intent." : "They must fail in completing their travel intent."} Your response must be structured as a JSON in the following schema: {"title": TEXT, "passage": TEXT}.`
            );
        } else if (!this.passage) {
            prompt +=
                "Write a short introduction (max 100 words) to their travel and give it a title.";
        } else {
            prompt +=
                "Write a short continuation (max 100 words) to their travel. Make sure to link smoothly from the previous chapter and their last choice.";
            prompt +=
                "And give the passage a title while considering the summaries of previous passages as well.";
        }
        prompt += `Use B1-level English for foreign EFL learner young adults. Focus on the Pacific Ocean and include relevant environmental details when appropriate. Do not include chapter numbers in the title.
        Use HTML tags: <b>, <i>, and <br> for formatting. No dashes.
        End with 2–6 meaningful choices that are relevant to their travel intent and have a purpose. Choices may reflect traits when suitable (${this.chars.map((c) => `${c.name}: ${c.trait}`).join(", ")}), or not (don't make up nonsense choices just to use the traits). Trait-based choices should have lower risk and/or higher progress levels (depending on the trait).
        Each choice must:
        - Advance story progress (0–100)
        - Include a risk level (0–100) (They lose progress from total by the choice's progress amount if the risk roll fails)

        ${this.remainingChoices ? `They are at ${this.progress}% progress and have ${this.remainingChoices} chapters left. No choice should bring total to 100% yet.` : `This is the final choice. Include at least one high-risk, high-reward option.`}
        High-risk = high-reward. No need to show risk/progress in text. Keep choices concise.

        Format the response as:
        {
          "title": TEXT,
          "passage": TEXT,
          "choices": [
            {
              "text": CHOICE_TEXT,
              "progress": 0-100,
              "risk": 0-100 
            }
          ],
          "summary": very brief summary of this chapter ${this.summaries.length ? `and their last choice.` : ""}
        }`;

        return prompt.replaceAll(/\\n|[\s\s]{2}/g, "");
    }
}

export function wait<T>(fn: () => T, time: number): Promise<T> {
    return new Promise<T>((res) => {
        setTimeout(() => {
            res(fn());
        }, time);
    });
}

type AI_RESPONSE = AI_CONTINUATION | AI_ENDING;

type AI_CONTINUATION = {
    title: string;
    passage: string;
    choices: Choice[];
    summary: string;
};

type AI_ENDING = {
    title: string;
    passage: string;
};

export type RollResult = {
    success: boolean;
    roll: number;
    required: number;
    progressDiff?: number;
};

export type Choice = {
    text: string;
    progress: number;
    risk: number;
};

export interface Character {
    name: string;
    gender: Gender;
    trait: Trait;
}

export type Gender = (typeof genders)[number];
export type Trait = (typeof traits)[number];
export type Intent = (typeof intents)[number];
