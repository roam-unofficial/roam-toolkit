// Stolen from https://github.com/jungj5/Save-the-Date/blob/master/%40types/chrono-node/index.d.ts
declare namespace chrono {
  export class ParsedResult {
    start: ParsedComponents;
    end: ParsedComponents;
    index: number;
    text: string;
    ref: Date;
  }

  export class ParsedComponents {
    assign(component: string, value: number): void;

    imply(component: string, value: number): void;

    get(component: string): number;

    isCertain(component: string): boolean;

    date(): Date;
  }

  export function parseDate(text: string, refDate?: Date, opts?: any): Date;

  export function parse(
    text: string,
    refDate?: Date,
    opts?: any
  ): ParsedResult[];
}

declare module 'chrono-node' {
  export = chrono;
}
