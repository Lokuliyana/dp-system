import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";

import { competitionsService } from "@/services/masterdata/competitions.service";
import { competitionRulesService } from "@/services/masterdata/competitionRules.service";
import { competitionRegistrationsService } from "@/services/masterdata/competitionRegistrations.service";
import { competitionTeamsService } from "@/services/masterdata/competitionTeams.service";
import { competitionResultsService } from "@/services/masterdata/competitionResults.service";
import { teamSelectionsService } from "@/services/masterdata/teamSelections.service";
import type { SaveTeamSelectionPayload, AutoGeneratePayload } from "@/services/masterdata/teamSelections.service";

export function useCompetitions(year?: number) {
  return useQuery({
    queryKey: qk.competitions.byYear(year),
    queryFn: () => competitionsService.list(year),
    staleTime: 60_000,
  });
}

export function useCreateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: competitionsService.create,
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: qk.competitions.byYear(c.year) });
    },
  });
}

export function useUpdateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      competitionsService.update(id, payload),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: qk.competitions.byYear(c.year) });
      qc.invalidateQueries({ queryKey: qk.competitions.byId(c.id) });
    },
  });
}

export function useDeleteCompetition(year?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitionsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.competitions.byYear(year) });
    },
  });
}

/* ----- Rules ----- */
export function useCompetitionRules(competitionId: string, year?: number) {
  return useQuery({
    queryKey: qk.competitionRules.byCompetition(competitionId, year),
    queryFn: () => competitionRulesService.list(competitionId, year),
    enabled: !!competitionId,
  });
}

export function useUpsertCompetitionRule(competitionId: string, year: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: competitionRulesService.upsert,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.competitionRules.byCompetition(competitionId, year),
      });
    },
  });
}

/* ----- Registrations ----- */
export function useCompetitionRegistrations(filters: Record<string, any>) {
  return useQuery({
    queryKey: qk.competitionRegistrations.list(filters),
    queryFn: () => competitionRegistrationsService.list(filters),
    enabled: !!filters.competitionId,
  });
}

export function useRegisterForCompetition(
  filtersToInvalidate: Record<string, any>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: competitionRegistrationsService.register,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.competitionRegistrations.list(filtersToInvalidate),
      });
    },
  });
}

export function useDeleteCompetitionRegistration(
  filtersToInvalidate: Record<string, any>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitionRegistrationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.competitionRegistrations.list(filtersToInvalidate),
      });
    },
  });
}

/* ----- Teams ----- */
export function useCompetitionTeams(competitionId: string, year?: number) {
  return useQuery({
    queryKey: qk.competitionTeams.byCompetition(competitionId, year),
    queryFn: () => competitionTeamsService.list({ competitionId, year }),
    enabled: !!competitionId,
  });
}

export function useCreateCompetitionTeam(competitionId: string, year: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: competitionTeamsService.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.competitionTeams.byCompetition(competitionId, year),
      });
    },
  });
}

/* ----- Results ----- */
export function useCompetitionResults(competitionId: string, year?: number) {
  return useQuery({
    queryKey: qk.competitionResults.byCompetition(competitionId, year),
    queryFn: () => competitionResultsService.list({ competitionId, year }),
    enabled: !!competitionId,
  });
}

export function useAllResults(year: number) {
  return useQuery({
    queryKey: ["competitionResults", "all", year],
    queryFn: () => competitionResultsService.list({ year }),
    enabled: !!year,
  });
}

export function useCreateCompetitionResult(
  competitionId: string,
  year: number
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: competitionResultsService.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.competitionResults.byCompetition(competitionId, year),
      });
    },
  });
}

export function useDeleteCompetitionResult(competitionId: string, year: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitionResultsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.competitionResults.byCompetition(competitionId, year),
      });
    },
  });
}

export function useHousePoints(year: number) {
  return useQuery({
    queryKey: ["housePoints", year],
    queryFn: () => competitionResultsService.housePoints(year),
    enabled: !!year,
  });
}

/* ----- Team Selections ----- */
export function useTeamSelection(level: "zonal" | "district" | "allisland", year: number) {
  return useQuery({
    queryKey: [...qk.teamSelections.byYear(year), level],
    queryFn: () => teamSelectionsService.get(level, year),
    enabled: !!year && !!level,
  });
}

export function useSaveTeamSelection(level: "zonal" | "district" | "allisland", year: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveTeamSelectionPayload) => teamSelectionsService.save(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...qk.teamSelections.byYear(year), level] });
    },
  });
}

export function useTeamSelectionSuggestions(year: number) {
  return useQuery({
    queryKey: ["teamSelection", "zonalSuggestions", year],
    queryFn: () => teamSelectionsService.getZonalSuggestions(year),
    enabled: !!year,
  });
}

export function useAutoGenerateTeamSelection(year: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AutoGeneratePayload) => teamSelectionsService.autoGenerate(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [...qk.teamSelections.byYear(year), variables.toLevel] });
    },
  });
}
