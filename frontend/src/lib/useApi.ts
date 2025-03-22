// src/lib/useApi.ts
import useSWR from "swr";
import fetchAPI from "./api";

const fetcher = async <T>(url: string): Promise<T> => {
  const { data, error } = await fetchAPI<T>(url);
  if (error) throw new Error(typeof error === "string" ? error : JSON.stringify(error));
  if (data === null) throw new Error("No data received");
  return data;
};


export const useApi = <T>(endpoint: string) => {
  const { data, error, mutate } = useSWR<T>(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minuto de deduplicación
  });
  return { data, error, isLoading: !data && !error, mutate };
};