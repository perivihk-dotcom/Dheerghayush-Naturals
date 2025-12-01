import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for background data refresh without disturbing the user
 * @param {Function} fetchFn - Async function that fetches data
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Refresh interval in milliseconds (default: 30000 = 30s)
 * @param {boolean} options.enabled - Whether auto-refresh is enabled (default: true)
 * @param {any[]} options.deps - Dependencies that trigger immediate refresh
 * @param {Function} options.onDataChange - Callback when data changes
 * @returns {Object} { data, loading, error, refresh, isRefreshing }
 */
const useBackgroundRefresh = (fetchFn, options = {}) => {
  const {
    interval = 30000,
    enabled = true,
    deps = [],
    onDataChange = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // Only true on initial load
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const dataRef = useRef(null);
  const isMountedRef = useRef(true);
  const intervalRef = useRef(null);

  // Deep comparison to check if data has changed
  const hasDataChanged = useCallback((newData, oldData) => {
    if (!oldData && newData) return true;
    if (!newData && oldData) return true;
    return JSON.stringify(newData) !== JSON.stringify(oldData);
  }, []);

  // Fetch data function
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isMountedRef.current) return;

    try {
      if (isBackground) {
        setIsRefreshing(true);
      }

      const result = await fetchFn();
      
      if (!isMountedRef.current) return;

      // Only update state if data has actually changed
      if (hasDataChanged(result, dataRef.current)) {
        dataRef.current = result;
        setData(result);
        if (onDataChange) {
          onDataChange(result);
        }
      }
      
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Background refresh error:', err);
      setError(err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchFn, hasDataChanged, onDataChange]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    fetchData(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [...deps]);

  // Set up interval for background refresh
  useEffect(() => {
    if (!enabled || interval <= 0) return;

    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, fetchData]);

  // Listen for visibility change - refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
  };
};

export default useBackgroundRefresh;
