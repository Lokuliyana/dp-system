"use client"

import type { Talent } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Star } from "lucide-react"

interface TalentsPortfolioProps {
  talents: Talent[]
}

export function TalentsPortfolio({ talents }: TalentsPortfolioProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-100 text-blue-800 border-blue-300",
      sports: "bg-red-100 text-red-800 border-red-300",
      arts: "bg-purple-100 text-purple-800 border-purple-300",
      leadership: "bg-amber-100 text-amber-800 border-amber-300",
      other: "bg-slate-100 text-slate-800 border-slate-300",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      academic: "📚",
      sports: "⚽",
      arts: "🎨",
      leadership: "👑",
      other: "✨",
    }
    return icons[category] || "🌟"
  }

  // Group talents by category
  const talentsByCategory = talents.reduce(
    (acc, talent) => {
      if (!acc[talent.category]) {
        acc[talent.category] = []
      }
      acc[talent.category].push(talent)
      return acc
    },
    {} as Record<string, Talent[]>,
  )

  if (talents.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No talents or skills recorded yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(talentsByCategory).map(([category, categoryTalents]) => (
          <Card key={category} className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <span className="capitalize">{category}</span>
                <Badge variant="outline" className="ml-auto">
                  {categoryTalents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryTalents.map((talent) => (
                <div key={talent.id} className={`border border-l-4 rounded-lg p-3 ${getCategoryColor(category)}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{talent.name}</h4>
                    <div className="text-lg">
                      {Array(Math.max(1, 4 - ["beginner", "intermediate", "advanced", "expert"].indexOf(talent.level)))
                        .fill("⭐")
                        .join("")}
                    </div>
                  </div>
                  <p className="text-xs opacity-75 capitalize">{talent.level}</p>
                  {talent.description && <p className="text-xs mt-2 opacity-80">{talent.description}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
