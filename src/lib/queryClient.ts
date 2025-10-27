import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error: any) => {
        // Não tentar novamente para erros 401, 403, 404
        if (error?.response?.status === 401 || 
            error?.response?.status === 403 || 
            error?.response?.status === 404) {
          return false
        }
        // Tentar até 3 vezes para outros erros
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true
    },
    mutations: {
      retry: false
    }
  }
})














