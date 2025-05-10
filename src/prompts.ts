import { NUM_CHAPTERS } from "./config";
import { setup, data, type PastChoice } from "./lib/core.svelte";

const chapterResponseFormat = `Format the response as: { "title": STR, "body": STR, "choices": [ { "text": STR, "progress": INT, "risk": INT} ], "summary": STR}`;
const endingResponseFormat = `Format the response as: { "title": STR, "body": STR}`;

export const systemPrompt = `You are a storywriter. Your audience are young adults.
    Don't include sensitive topics. Use B1 level of English.
    Focus on the Pacific Ocean and include relevant information about it when approppriate.
    Use HTML tags <b>, <i> and <br> for formatting the body. Don't use <br> at the end.
    Your story will have ${NUM_CHAPTERS} chapters in total.
    Give the chapter a title (don't include chapter number).`;

export function makeIntroPrompt(): string {
    return `${makeBasePart()}
    Write the introduction (Chapter 1) to their travel (max 100 words).
    Write a brief summary of this chapter as well.
    ${makeChoicesPart(1)}
    ${chapterResponseFormat}`;
}

export function makeChapterPrompt(
    chapterNum: number,
    lastChoice: PastChoice,
): string {
    return `${makeBasePart()}
    ${makeSummaryPart()}
    ${makeLastChoicePart(lastChoice)}
    Write Chapter ${chapterNum} to continue the story (max 80 words). 
    Write a brief summary of this chapter as well.
    ${makeChoicesPart(chapterNum)}
    ${chapterResponseFormat}`;
}

export function makeEndingPrompt(lastChoice: PastChoice): string {
    return `${makeBasePart()}
    ${makeSummaryPart()}
    ${makeLastChoicePart(lastChoice)}
    Write an ending to the story (max 120 words).
    ${data.intentRoll?.success ? "They must achieve their travel intent." : "They must fail their travel intent."}
    ${endingResponseFormat}`;
}

function makeBasePart(): string {
    return `${setup.chars.map((c) => `${c.name} (${c.gender})`).join(" and ")} are taking a trip to the Pacific Ocean.
    They are traveling on their own boat named ${setup.boatName}.
    Their intent of travel is ${setup.intent}.`;
}

function makeSummaryPart(): string {
    const sum = data.pastChapters
        .map((body, i) => {
            const choice = data.pastChoices[i];
            return `Chapter ${i + 1}) Summary: "${body}" - Choice: "${choice.body}" ${choice.success ? "(Successfull choice)" : "(Failed choice)"}`;
        })
        .join(" -- ");
    return `Their story so far is as follows with their choices: ${sum}`;
}

function makeLastChoicePart(choice: PastChoice): string {
    return `They made this choice at the end of the last chapter: "${choice.body}" and they ${choice.success ? "were successfull" : "failed"}.`;
}

function makeChoicesPart(chapterNum: number) {
    const maxProgress = Math.ceil(
        (100 - data.progress) / (NUM_CHAPTERS - chapterNum),
    );
    return `End it by giving the reader 2-6 choices on how to ${chapterNum === NUM_CHAPTERS - 1 ? "end" : "continue"} the story.
    Consider characters' traits (${setup.chars.map((c) => `${c.name}: ${c.trait}`).join(", ")}) when giving choices.
    Each choice must offer a progress level reward (0-100) and a risk level (0-100). Higher risk choices must give higher progress rewards.
    Don't indicate progress/risk levels in choice text.
    Maximum progress reward in a choice must be ${maxProgress}.`;
}
