import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/auth.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
  });
}
