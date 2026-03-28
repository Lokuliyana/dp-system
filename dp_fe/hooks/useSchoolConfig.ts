import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolService, type AttendanceConfig } from "@/services/school.service";
import { useToast } from "./use-toast";

export const useSchoolConfig = () => {
  const queryKey = ["school-config"];
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey,
    queryFn: schoolService.getAttendanceConfig,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const updateMutation = useMutation({
    mutationFn: (config: AttendanceConfig) => schoolService.updateAttendanceConfig(config),
    onSuccess: (newConfig) => {
      queryClient.setQueryData(queryKey, newConfig);
      toast({
        title: "Configuration updated",
        description: "School attendance settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateConfig: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
