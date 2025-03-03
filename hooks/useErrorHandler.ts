'use client';

import { useState, useCallback } from 'react';

/**
 * A hook that helps functional components work with error boundaries.
 * It provides a function to handle errors and a function to reset the error state.
 */
export function useErrorHandler<T extends Error = Error>() {
  const [error, setError] = useState<T | null>(null);

  const handleError = useCallback((error: T) => {
    setError(error);
    // Re-throw the error to be caught by the nearest error boundary
    throw error;
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    resetError
  };
}

/**
 * A utility function to handle async errors in functional components.
 * It wraps an async function and handles any errors that occur.
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  handleError: (error: Error) => void
) {
  return async (...args: Args): Promise<T | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  };
}

export default useErrorHandler; 