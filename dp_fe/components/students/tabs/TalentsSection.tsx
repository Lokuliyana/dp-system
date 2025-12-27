"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Plus, Trash2, Star } from "lucide-react";
import { TALENT_CATEGORIES } from "@/lib/school-data";
import type { Talent } from "@/types/models";

interface TalentsSectionProps {
  talents: Talent[];
  onAddTalent: (talent: Omit<Talent, "id">) => void;
  onRemoveTalent: (talentId: string) => void;
}

export function TalentsSection({ talents, onAddTalent, onRemoveTalent }: TalentsSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "academic" as Talent["category"],
    level: "beginner" as Talent["level"],
    description: "",
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"level" | "name">("level");

  const filteredAndSortedTalents = useMemo(() => {
    let filtered = [...talents];

    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    if (filterLevel !== "all") {
      filtered = filtered.filter((t) => t.level === filterLevel);
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const order: Record<string, number> = {
        expert: 0,
        advanced: 1,
        intermediate: 2,
        beginner: 3,
      };
      return order[a.level] - order[b.level];
    });

    return filtered;
  }, [talents, filterCategory, filterLevel, sortBy]);

  const talentAnalytics = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    talents.forEach((talent) => {
      byCategory[talent.category] = (byCategory[talent.category] || 0) + 1;
      byLevel[talent.level] = (byLevel[talent.level] || 0) + 1;
    });

    return { byCategory, byLevel };
  }, [talents]);

  const handleAddTalent = () => {
    if (!formData.name.trim()) return;
    onAddTalent(formData);
    setFormData({
      name: "",
      category: "academic",
      level: "beginner",
      description: "",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-100 text-blue-800",
      sports: "bg-red-100 text-red-800",
      arts: "bg-purple-100 text-purple-800",
      leadership: "bg-amber-100 text-amber-800",
      other: "bg-slate-100 text-slate-800",
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-blue-100 text-blue-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-orange-100 text-orange-800",
      expert: "bg-green-100 text-green-800",
    };
    return colors[level] || "bg-slate-100 text-slate-800";
  };

  const getLevelIcon = (level: string) => {
    const map: Record<string, string> = {
      beginner: "⭐",
      intermediate: "⭐⭐",
      advanced: "⭐⭐⭐",
      expert: "⭐⭐⭐⭐",
    };
    return map[level] || "";
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Add Talent / Skill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Basketball, Singing, Olympiad Maths"
              className="bg-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData((p) => ({ ...p, category: val as any }))}
              >
                <SelectTrigger className="bg-white">
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
                onValueChange={(val) => setFormData((p) => ({ ...p, level: val as any }))}
              >
                <SelectTrigger className="bg-white">
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
              <Button
                onClick={handleAddTalent}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Short description of skill or achievements…"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics + list */}
      {talents.length > 0 && (
        <>
          <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">Skills Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{talents.length}</p>
                  <p className="text-sm text-slate-600">Total Skills</p>
                </div>
                {Object.entries(talentAnalytics.byLevel).map(([level, count]) => (
                  <div key={level} className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                    <p className="mt-1 text-sm capitalize text-slate-600">{level}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-3 text-sm font-medium text-slate-700">By Category</p>
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

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Current Talents ({filteredAndSortedTalents.length})
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-9 w-32">
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
                    <SelectTrigger className="h-9 w-32">
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

                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="h-9 w-28">
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
                <p className="py-8 text-center text-slate-500">
                  No talents for current filters.
                </p>
              ) : (
                filteredAndSortedTalents.map((talent) => (
                  <div
                    key={talent.id}
                    className="rounded-lg border border-slate-200 p-4 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{talent.name}</h3>
                          <Badge className={getCategoryColor(talent.category)}>
                            {talent.category}
                          </Badge>
                          <Badge className={getLevelColor(talent.level)}>
                            {getLevelIcon(talent.level)} {talent.level}
                          </Badge>
                        </div>
                        {talent.description && (
                          <p className="text-sm text-slate-700">{talent.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTalent(talent.id)}
                        className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
