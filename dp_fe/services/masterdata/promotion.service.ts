import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"

export type TriggerPromotionPayload = {
  fromYear: number
  toYear: number
  dryRun?: boolean
}

export const promotionService = {
  trigger(payload: TriggerPromotionPayload) {
    return axiosInstance.post(endpoints.promotion, payload)
      .then(r => r.data.data as {
        fromYear: number
        toYear: number
        totalEligible: number
        promoted: number
        skippedNoNextGrade: number
        skippedMissingGrade: number
        dryRun: boolean
      })
  },
}
