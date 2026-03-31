/**
 * QueryProvider Component
 * Provides TanStack Query (React Query) functionality
 * Optional but recommended for server state management
 */

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Query Client configuration
 * Can be customized based on needs (cache times, retry times, etc.)
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes
        staleTime: 1000 * 60 * 5,
        // Garbage collect unused queries after 10 minutes
        gcTime: 1000 * 60 * 10,
        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        // Refetch on window focus
        refetchOnWindowFocus: true,
        // Refetch on mount if cached data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations 1 time
        retry: 1,
      },
    },
  });
};

let queryClient: QueryClient | null = null;

/**
 * Get or create QueryClient instance
 * Singleton pattern to ensure only one instance
 */
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always create a new instance
    return createQueryClient();
  }

  // Browser: memoize the client instance
  if (!queryClient) {
    queryClient = createQueryClient();
  }

  return queryClient;
};

/**
 * Query Provider - Wraps app with TanStack Query provider
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
