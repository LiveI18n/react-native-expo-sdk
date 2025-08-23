// global.d.ts
export {};

declare global {
  // Core fetch types
  type RequestInfo = string | Request;

  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    signal?: AbortSignal | null;
  }

  interface HeadersInit {
    [key: string]: string;
  }

  interface BodyInit {}

  interface Response {
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly url: string;

    clone(): Response;
    json(): Promise<any>;
    text(): Promise<string>;
    blob(): Promise<Blob>;
  }

  interface Request {
    readonly url: string;
    readonly method: string;
    readonly headers: HeadersInit;
    readonly body?: BodyInit | null;
  }

  interface Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
  }

  function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

  // React Native globals
  const console: {
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };

  const setTimeout: (callback: () => void, delay: number) => number;
  const require: (module: string) => any;

  // React types
  namespace React {
    type ReactNode = string | number | JSX.Element | ReactNode[] | null | undefined;
    interface FC<P = {}> {
      (props: P): JSX.Element | null;
    }
    function useState<T>(initialState: T): [T, (newState: T) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  }
}