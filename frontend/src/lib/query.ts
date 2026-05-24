import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";

/** Invalidate session-related queries after login/logout. */
export function invalidateAuthQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
}
