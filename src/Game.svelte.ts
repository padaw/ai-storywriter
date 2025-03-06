export class Game {
    static BASE_STORY = [
        "Last weekend, I was cleaning my room when I found a small, old key under my bed. It looked very strange—it was golden and had strange symbols on it. I didn’t know where it came from, but I felt excited. Maybe it opened something special!",
        'I showed the key to my best friend, Emma. She said, "Wow! Maybe it’s a treasure key! Let’s find out what it opens." We thought about where to start looking. There were three places we could check: the old tree in the park, the dusty box in the attic, or the locked drawer in the school library.',
    ];
    static BASE_CHOICES = [
        "Go to the park and check the old tree.",
        "Go to the attic and open the dusty box.",
        "Go to the school library and try the locked drawer.",
    ];

    private url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3IiD8_oiP2XCdzBukngmNhxv53ir98UQ";

    iterations = 0;
    finished = $state(false);
    pending = $state(false);
    lines = $state<Line[]>(Game.BASE_STORY.map(t => ({text: t})));
    choices = $state(Game.BASE_CHOICES);
    question = $state("What should we do next?");

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
        return `
            You are a storywriter for an EFL game designed for 13-year-old A2 English learners. Continue a story based on user choices. The user has made ${this.iterations} choices so far, make sure to finish the story at most 4 choices. Use age-appropriate language, avoid sensitive topics, and focus on Simple Past Tense. Continue the story in at most 2 paragraphs long passages, and if it didn't reach the end yet, offer 3 choices for the user to make. Format responses as compressed JSON: {"finished": boolean, "text": [...], "question": "...", "choices": [...]}.
            This is the story so far: '${this.lines.join()}'
            The last question was: '${this.question}'
            And the user's answer was: '${choice}'
        `.trim();
    }
}
