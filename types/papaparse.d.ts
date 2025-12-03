declare namespace Papa {
  interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  }

  interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  interface ParseConfig<T = any> {
    header?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    complete?: (results: ParseResult<T>) => void;
    error?: (error: Error) => void;
  }

  function parse<T = any>(input: any, config?: ParseConfig<T>): ParseResult<T>;
}

declare const Papa: {
  parse: typeof Papa.parse;
};

export = Papa;
export as namespace Papa;
