// @ts-ignore
import data from "../../data.txt?raw";

const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3IiD8_oiP2XCdzBukngmNhxv53ir98UQ";
const MAX_ITERATIONS = 3;

const [titleStr, story, _question, options] = <string>data.split("\n\n--\n\n");

export const title = titleStr;

export function getLetter(n: number): string {
    return String.fromCharCode(65 + n);
}

export class Game {
    lines: Line[] = $state(story.split("\n").map((t) => ({ text: t })));
    question: string = $state(_question);
    choices: string[] = $state(options.split("\n").slice(0, -1));
    finished = $state(false);
    pending = $state(false);

    private iterations = 0;

    private makePrompt(choice: string): string {
        const context = `
        The story so far: '${this.lines
            .filter((line) => "text" in line)
            .map((line) => line.text)
            .join()}'
        The question for the user was: '${this.question}'
        The user made this choice: '${choice}'

        Keep it short: 2 paragraphs at most.
        Use simple past tense: Focus on this grammar topic throughout the story.
        Use A2 level English.
        Users are aged 13, keep it age appropriate.
        Avoid sensitive topics and bad language.
    `;
        if (this.iterations >= MAX_ITERATIONS) {
            return `
            Finish the story considering the user's choice.
            ${context}

            Respond in JSON: {"finished": true, text: [...paragraphs]}
        `;
        } else {
            return `
            Continue the story based on user's choice. End by asking a question and give 3 choices for the user to make on how to continue the story.
            ${context}

            Respond in JSON: {"finished": false, text: [...paragraphs], question: "...", choices: [...choices]}
        `;
        }
    }

    async post(choiceIdx: number, cb: Function) {
        const choice = this.choices[choiceIdx];
        if (!choice) {
            throw new Error("Invalid choice");
        }

        this.pending = true;

        const prompt = this.makePrompt(choice);
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
            throw new Error("Unexpected AI response");
        }

        const aiJson = text.slice(8, -4).replaceAll("\n", "");

        let aiResponse: AIResponse;
        try {
            aiResponse = JSON.parse(aiJson);
        } catch (e) {
            console.error(text);
            throw new Error("Invalid JSON");
        }

        this.lines.push(
            { question: this.question, answer: choice },
            ...aiResponse.text.map((t) => ({ text: t })),
        );

        if (aiResponse.finished) {
            this.choices = [];
            this.question = "";
            this.finished = true;
        } else {
            this.choices = aiResponse.choices;
            this.question = aiResponse.question;
        }

        this.pending = false;
        this.iterations++;

        cb();
    }
}
