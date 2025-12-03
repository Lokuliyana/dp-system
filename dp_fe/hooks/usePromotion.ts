import { useMutation } from "@tanstack/react-query"
import { promotionService } from "@/services/masterdata/promotion.service"

export function useTriggerPromotion() {
  return useMutation({
    mutationFn: promotionService.trigger,
  })
}
