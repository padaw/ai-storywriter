declare interface AIResponse {
    finished: boolean;
    text: string[];
    question: string;
    choices: string[];
}

declare type Line =
    | {
          text: string;
      }
    | { question: string; answer: string };
