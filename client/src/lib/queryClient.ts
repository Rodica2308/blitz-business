import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { handleLocalApi } from "./localDatabase";

export async function apiRequest<T = any>({
  url,
  method = "GET",
  data,
}: {
  url: string;
  method?: string;
  data?: unknown;
}): Promise<T> {
  try {
    const result = handleLocalApi(url, method, data);
    return result as T;
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const result = handleLocalApi(queryKey[0] as string, "GET");
      return result as T;
    } catch (e) {
      if (unauthorizedBehavior === "returnNull") {
        return null as T;
      }
      throw e;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 300000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
