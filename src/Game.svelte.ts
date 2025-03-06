export class Game {
    static BASE_STORY = [
        "Emma loved rainy days. She sat by the window with a cup of tea, watching the raindrops slide down the glass. It was a perfect day for reading. She picked up her book, but just as she opened it, the doorbell rang.",
        "She wasn’t expecting anyone. Curious, she walked to the door and opened it. There was no one outside. Only a small, white envelope lay on the welcome mat.",
        "Emma picked it up and looked around, but the street was empty. She stepped inside and carefully opened the envelope. Inside was a note, written in elegant handwriting:",
        '"Meet me at the old oak tree at midnight. Trust me."',
        "Emma’s heart skipped a beat. Who had sent this? And why?",
        "She thought for a moment. The old oak tree was in the park near her house. It was a quiet place, especially at night. Should she go? It could be dangerous… but it could also be something exciting.",
        "Emma took a deep breath and looked at the note again. She had a decision to make.",
    ];
    static BASE_CHOICES = [
        "Go to the old oak tree at midnight",
        "Ignore the letter and stay home",
        "Ask a friend for help",
    ];

    private url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3IiD8_oiP2XCdzBukngmNhxv53ir98UQ";

    iterations = 0;
    finished = $state(false);
    pending = $state(false);
    lines = $state<Line[]>(Game.BASE_STORY.map((t) => ({ text: t })));
    choices = $state(Game.BASE_CHOICES);
    question = $state("What should Emma do next?");

    container?: HTMLDivElement;

    async makeChoice(choiceIdx: number) {
        if (this.finished) {
            return;
        }
        this.pending = true;
        this.iterations++;

        const choice = this.choices[choiceIdx];
        const prompt = this.makePrompt(choice);

        fetch(this.url, {
            method: "POST",
            mode: "cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        })
            .then((r) => r.json())
            .then((json) => {
                let text: string =
                    json?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) {
                    console.error(json);
                    throw new Error();
                }
                // take care of llm formatting of the json
                text = text.slice(8, -4).replaceAll("\n", "");

                let response: AIResponse;
                try {
                    response = JSON.parse(text);
                } catch (e) {
                    console.error(text);
                    throw new Error("Invalid JSON");
                }

                this.lines.push(
                    { question: this.question, answer: choice },
                    ...response.text.map((t) => ({ text: t })),
                );

                if (response.finished) {
                    this.choices = [];
                    this.question = "";
                    this.finished = true;
                } else {
                    this.choices = response.choices;
                    this.question = response.question;
                }

                this.pending = false;

                // hacky asf
                setTimeout(() => {
                    this.container?.scroll({ top: 100000 });
                }, 100);
            });
    }

    private makePrompt(choice: string): string {
        const context = `
                The story so far: '${this.lines.filter(line => "text" in line).map(line => line.text).join()}'
                The question for the user was: '${this.question}'
                The user made this choice: '${choice}'

                Keep it short: 2 paragraphs at most.
                Use Simple Past Tense: Focus on this grammar topic throughout the story.
                Use A2 level English.
                Avoid sensitive topics, bad language, or overly childish themes.
        `
        if (this.iterations > 3) {
            return `
                Finish this story considering the user's choice.
                ${context}

                Respond in JSON: {"finished": true, text: [...paragraphs]}
            `
        } else {
            return `
                Continue this story based on user's choice. Ask a question and give them 3 choices to further continue the story.
                ${context}

                Respond in JSON: {"finished": false, text: [...paragraphs], question: "...", choices: [...choices]}
            `
        }
    }
}
