import { useState, useEffect, useCallback } from 'react';
import { history, generate } from '../services/api';

/**
 * Custom hook for managing generation history
 */
export function useGenerations() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [pagination.page]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const result = await history.list(pagination.page);
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  const createGeneration = useCallback(async (topic, format = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const result = await generate.create(topic, format);
      return result;
    } catch (err) {
      setError(err.error || 'Generation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHistory = useCallback(async (id) => {
    try {
      await generate.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.error || 'Delete failed');
      throw err;
    }
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    createGeneration,
    deleteHistory,
    setPage: (page) => setPagination(prev => ({ ...prev, page })),
    refresh: fetchHistory,
  };
}
