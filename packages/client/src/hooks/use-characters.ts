// ──────────────────────────────────────────────
// React Query: Character hooks
// ──────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export const characterKeys = {
  all: ["characters"] as const,
  list: () => [...characterKeys.all, "list"] as const,
  detail: (id: string) => [...characterKeys.all, "detail", id] as const,
  personas: ["personas"] as const,
};

export function useCharacters() {
  return useQuery({
    queryKey: characterKeys.list(),
    queryFn: () => api.get<unknown[]>("/characters"),
  });
}

export function useCharacter(id: string | null) {
  return useQuery({
    queryKey: characterKeys.detail(id ?? ""),
    queryFn: () => api.get(`/characters/${id}`),
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/characters", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.list() }),
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/characters/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.list() }),
  });
}

export function usePersonas() {
  return useQuery({
    queryKey: characterKeys.personas,
    queryFn: () => api.get<unknown[]>("/characters/personas/list"),
  });
}
