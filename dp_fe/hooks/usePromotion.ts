import { useMutation, useQueryClient } from "@tanstack/react-query"
import { promotionService } from "@/services/masterdata/promotion.service"
import { qk } from "@/lib/queryKeys"

export function useTriggerPromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: promotionService.trigger,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.students.all })
    },
  })
}
