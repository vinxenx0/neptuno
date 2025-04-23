// frontend/src/hooks/useFetchData.ts
// frontend/src/hooks/useFetchData.ts
// Custom hook para realizar peticiones HTTP y manejar el estado de carga, error y datos.
import { useState, useEffect } from 'react';

interface FetchDataResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useFetchData<T>(url: string, dependencies: any[] = []): FetchDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, dependencies]);

  return { data, error, loading };
}