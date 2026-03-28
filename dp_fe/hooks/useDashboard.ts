import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { qk } from "@/lib/queryKeys";

export function useDashboard() {
  return useQuery({
    queryKey: qk.dashboard.all,
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 60_000,
  });
}
