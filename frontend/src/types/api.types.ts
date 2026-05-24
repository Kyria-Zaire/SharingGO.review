export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    requestId: string;
  };
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}
