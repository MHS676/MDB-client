/**
 * Professional Data Fetching Hook
 * Handles loading, error, and data states consistently across the app
 */

import { useState, useCallback, useEffect } from 'react';

export const useApiData = (asyncFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    fetch();
  }, dependencies);

  return { data, loading, error, refetch: fetch };
};

/**
 * Hook for handling form submissions with API calls
 */
export const useApiMutation = (asyncFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      console.error('Mutation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, loading, error, mutate };
};

/**
 * Hook for pagination
 */
export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
};
