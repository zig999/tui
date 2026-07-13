import { QueryClient, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";

/*
  Global QueryClient (CLAUDE.md → Data Layer):
    - retry: 1
    - errors handled centrally in the Query Cache onError (the useQuery onError
      callback was removed in v5).
*/
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar dados.",
      );
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      // staleTime is per-query: stable data 5min, volatile data 0. Set at the hook.
    },
  },
});
