// src/lib/useApi.ts
import useSWR from "swr";
import fetchAPI from "./api";

const fetcher = async <T>(url: string) => {
  const { data, error } = await fetchAPI<T>(url);
  if (error) throw error;
  return data;
};

export const useApi = <T>(endpoint: string) => {
  const { data, error, mutate } = useSWR<T>(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minuto de deduplicación
  });
  return { data, error, isLoading: !data && !error, mutate };
};