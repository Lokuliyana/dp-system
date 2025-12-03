"use client"

import { useEffect, useMemo, useState } from "react"
import type { Squad } from "@/types/models"
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button, Checkbox, Popover, PopoverContent, PopoverTrigger } from "@/components/ui"
import {
  useCreateSquad,
  useDeleteSquad,
  useSquads,
  useUpdateSquad,
} from "@/hooks/useSquads"
import { useGrades } from "@/hooks/useGrades"
import { useSections } from "@/hooks/useSections"
import { Shield, Sword, Star, Zap, Trophy, Target, Flag, Crown, Medal, Flame, Gavel, Scale, Book, Heart, Music, Smile, Sun, Moon, Cloud, Umbrella, Anchor, Key, Lock, Unlock, Bell, Search, User, Users, Settings, Home, Briefcase, Calendar, Clock, Map, MapPin, Navigation, Compass, Globe, Smartphone, Monitor, Cpu, Database, Server, Wifi, Bluetooth, Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from "lucide-react"
import * as LucideIcons from "lucide-react"

type FormState = {
  nameSi: string
  nameEn: string
  icon: string
  assignedGradeIds: string[]
  assignedSectionIds: string[]
}

const emptyForm: FormState = {
  nameSi: "",
  nameEn: "",
  icon: "Shield",
  assignedGradeIds: [],
  assignedSectionIds: [],
}

const AVAILABLE_ICONS = [
  "Shield", "Sword", "Star", "Zap", "Trophy", "Target", "Flag", "Crown", "Medal", "Flame",
  "Gavel", "Scale", "Book", "Heart", "Music", "Smile", "Sun", "Moon", "Cloud", "Umbrella",
  "Anchor", "Key", "Lock", "Bell", "Search", "User", "Users", "Settings", "Home", "Briefcase"
]

interface Props {
  title?: string
  description?: string
}

export function SquadCrudPanel({ title = "Squads", description }: Props) {
  const { data: squads = [], isLoading } = useSquads()
  const { data: grades = [] } = useGrades()
  const { data: sections = [] } = useSections()
  const createSquad = useCreateSquad()
  const updateSquad = useUpdateSquad()
  const deleteSquad = useDeleteSquad()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<Squad | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        nameEn: editing.nameEn,
        nameSi: editing.nameSi,
        icon: editing.icon || "Shield",
        assignedGradeIds: editing.assignedGradeIds || [],
        assignedSectionIds: editing.assignedSectionIds || [],
      })
    } else {
      setForm(emptyForm)
    }
  }, [editing])

  const handleSubmit = async () => {
    const payload = { ...form }
    if (editing) {
      await updateSquad.mutateAsync({ id: editing.id, payload })
    } else {
      await createSquad.mutateAsync(payload)
    }
    setEditing(null)
    setForm(emptyForm)
  }

  const renderIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as any)[iconName] || Shield
    return <Icon className={className} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name (English)</Label>
            <Input
              value={form.nameEn}
              onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              placeholder="e.g., Track Squad"
            />
          </div>
          <div className="space-y-2">
            <Label>Name (Sinhala)</Label>
            <Input
              value={form.nameSi}
              onChange={(e) => setForm((f) => ({ ...f, nameSi: e.target.value }))}
              placeholder="Localized name"
            />
          </div>
        </div>

        <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2">
                <Input
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="Icon name (e.g. Shield)"
                    className="flex-1"
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-10 px-0 shrink-0" title="Pick an icon">
                            {renderIcon(form.icon, "h-4 w-4")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="end">
                        <div className="grid grid-cols-6 gap-2">
                            {AVAILABLE_ICONS.map((iconName) => (
                                <button
                                    key={iconName}
                                    onClick={() => setForm(f => ({ ...f, icon: iconName }))}
                                    className={`p-2 rounded hover:bg-slate-100 flex items-center justify-center transition-colors ${form.icon === iconName ? 'bg-slate-100 ring-2 ring-slate-400' : ''}`}
                                    title={iconName}
                                >
                                    {renderIcon(iconName, "h-5 w-5 text-slate-700")}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2">Eligible Grades</p>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {grades.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.assignedGradeIds.includes(g.id)}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        assignedGradeIds: checked
                          ? [...f.assignedGradeIds, g.id]
                          : f.assignedGradeIds.filter((id) => id !== g.id),
                      }))
                    }
                  />
                  <span>{g.nameEn}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2">Eligible Sections</p>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {sections.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.assignedSectionIds.includes(s.id)}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        assignedSectionIds: checked
                          ? [...f.assignedSectionIds, s.id]
                          : f.assignedSectionIds.filter((id) => id !== s.id),
                      }))
                    }
                  />
                  <span>{s.nameEn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={createSquad.isPending || updateSquad.isPending}>
            {editing ? "Update Squad" : "Create Squad"}
          </Button>
          {editing && (
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null)
                setForm(emptyForm)
              }}
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="border rounded-lg divide-y">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading squads...</div>
          ) : squads.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No squads created yet.</div>
          ) : (
            squads.map((squad) => (
              <div key={squad.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    {renderIcon(squad.icon || "Shield", "h-5 w-5")}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{squad.nameEn}</p>
                    <p className="text-sm text-muted-foreground">{squad.nameSi}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(squad)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSquad.mutate(squad.id)}
                    disabled={deleteSquad.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
