export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    requestId: string;
  };
}

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}
