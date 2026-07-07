'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for handling API errors and network failures
 */
export function useErrorHandler() {
  const router = useRouter();

  const handleError = useCallback(
    (error: any, context?: string) => {
      console.error(`[${context || 'Error'}]`, error);

      // Network error
      if (!navigator.onLine) {
        console.warn('Network offline');
        return {
          type: 'offline',
          message: 'No internet connection',
          retryable: true,
        };
      }

      // API error
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            // Unauthorized - redirect to login
            router.push('/login');
            return {
              type: 'auth',
              message: 'Session expired. Please login again.',
              retryable: false,
            };

          case 403:
            return {
              type: 'forbidden',
              message: 'You do not have permission for this action.',
              retryable: false,
            };

          case 404:
            return {
              type: 'not_found',
              message: 'Resource not found.',
              retryable: false,
            };

          case 429:
            // Rate limited
            const retryAfter = error.response.headers['retry-after'] || 60;
            return {
              type: 'rate_limit',
              message: `Rate limited. Try again in ${retryAfter}s`,
              retryable: true,
              retryAfter: parseInt(retryAfter),
            };

          case 500:
          case 502:
          case 503:
            return {
              type: 'server_error',
              message: 'Server error. Please try again later.',
              retryable: true,
            };

          default:
            return {
              type: 'api_error',
              message: data?.message || 'API request failed',
              retryable: true,
              details: data,
            };
        }
      }

      // Timeout error
      if (error.code === 'ECONNABORTED') {
        return {
          type: 'timeout',
          message: 'Request timeout. Please try again.',
          retryable: true,
        };
      }

      // Generic error
      return {
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
        retryable: false,
      };
    },
    [router]
  );

  return { handleError };
}

/**
 * Hook for global error monitoring
 */
export function useGlobalErrorListener() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Send to Sentry or monitoring service
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Send to Sentry or monitoring service
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

/**
 * Hook for API error recovery with exponential backoff
 */
export function useRetry() {
  const retry = useCallback(
    async (
      fn: () => Promise<any>,
      maxAttempts: number = 3,
      delayMs: number = 1000
    ) => {
      let lastError;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;

          if (attempt < maxAttempts - 1) {
            const delay = delayMs * Math.pow(2, attempt); // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError;
    },
    []
  );

  return { retry };
}
