"use client"

import { type Talent, TALENT_CATEGORIES } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { useState, useMemo } from "react"
import { Plus, Trash2, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"

interface TalentsProps {
  talents: Talent[]
  onAddTalent: (talent: Omit<Talent, "id">) => void
  onRemoveTalent: (talentId: string) => void
}

export function StudentTalents({ talents, onAddTalent, onRemoveTalent }: TalentsProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "academic" as const,
    level: "beginner" as const,
    description: "",
  })

  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"level" | "name">("level")

  const filteredAndSortedTalents = useMemo(() => {
    let filtered = [...talents]

    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }

    if (filterLevel !== "all") {
      filtered = filtered.filter((t) => t.level === filterLevel)
    }

    filtered.sort((a, b) => {
      if (sortBy === "level") {
        const levelOrder = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 }
        return levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder]
      } else {
        return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [talents, filterCategory, filterLevel, sortBy])

  const talentAnalytics = useMemo(() => {
    const byCategory: Record<string, number> = {}
    const byLevel: Record<string, number> = {}

    talents.forEach((talent) => {
      byCategory[talent.category] = (byCategory[talent.category] || 0) + 1
      byLevel[talent.level] = (byLevel[talent.level] || 0) + 1
    })

    return { byCategory, byLevel }
  }, [talents])

  const handleAddTalent = () => {
    if (formData.name.trim()) {
      onAddTalent(formData)
      setFormData({ name: "", category: "academic", level: "beginner", description: "" })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-100 text-blue-800",
      sports: "bg-red-100 text-red-800",
      arts: "bg-purple-100 text-purple-800",
      leadership: "bg-amber-100 text-amber-800",
      other: "bg-slate-100 text-slate-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-blue-100 text-blue-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-orange-100 text-orange-800",
      expert: "bg-green-100 text-green-800",
    }
    return colors[level] || "bg-gray-100 text-gray-800"
  }

  const getLevelIcon = (level: string) => {
    const icons: Record<string, string> = {
      beginner: "⭐",
      intermediate: "⭐⭐",
      advanced: "⭐⭐⭐",
      expert: "⭐⭐⭐⭐",
    }
    return icons[level] || ""
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Form to add talent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Add New Talent or Skill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Talent Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Basketball, Mathematics, Singing"
              className="bg-white border-slate-200"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TALENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Level</label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value as any }))}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner ⭐</SelectItem>
                  <SelectItem value="intermediate">Intermediate ⭐⭐</SelectItem>
                  <SelectItem value="advanced">Advanced ⭐⭐⭐</SelectItem>
                  <SelectItem value="expert">Expert ⭐⭐⭐⭐</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddTalent} className="bg-blue-600 hover:bg-blue-700 gap-2 w-full">
                <Plus className="h-4 w-4" />
                Add Talent
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the talent or skill..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {talents.length > 0 && (
        <>
          {/* Analytics Summary */}
          <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Skills Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{talents.length}</p>
                  <p className="text-sm text-slate-600">Total Skills</p>
                </div>

                {Object.entries(talentAnalytics.byLevel).map(([level, count]) => (
                  <div key={level} className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                    <p className="text-sm text-slate-600 capitalize">{level}</p>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-3">By Category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(talentAnalytics.byCategory).map(([category, count]) => (
                    <Badge key={category} className={getCategoryColor(category)}>
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter and Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Current Talents & Skills ({filteredAndSortedTalents.length})
                </CardTitle>

                <div className="flex gap-2 flex-wrap">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {TALENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-28 h-9">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level">By Level</SelectItem>
                      <SelectItem value="name">By Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {filteredAndSortedTalents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {talents.length === 0
                    ? "No talents added yet. Add one to get started!"
                    : "No talents match your selected filters."}
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredAndSortedTalents.map((talent) => (
                    <div
                      key={talent.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900">{talent.name}</h3>
                            <Badge className={getCategoryColor(talent.category)}>{talent.category}</Badge>
                            <Badge className={getLevelColor(talent.level)}>
                              {getLevelIcon(talent.level)} {talent.level}
                            </Badge>
                          </div>
                          {talent.description && <p className="text-sm text-slate-600 mb-2">{talent.description}</p>}
                        </div>
                        <Button
                          onClick={() => onRemoveTalent(talent.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
