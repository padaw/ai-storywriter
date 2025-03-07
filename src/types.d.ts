declare type AIResponse =
    | {
          finished: false;
          text: string[];
          question: string;
          choices: string[];
      }
    | {
          finished: true;
          text: string[];
      };

declare type Line =
    | {
          text: string;
      }
    | {
          question: string;
          answer: string;
      };
