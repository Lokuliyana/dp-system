"use client"

import { useEffect, useState } from "react"
import type { House } from "@/types/models"
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from "@/components/ui"
import {
  useCreateHouse,
  useDeleteHouse,
  useHouses,
  useUpdateHouse,
} from "@/hooks/useHouses"

type FormState = {
  nameSi: string
  nameEn: string
  color: string
  mottoSi?: string
  mottoEn?: string
}

const emptyForm: FormState = {
  nameSi: "",
  nameEn: "",
  color: "",
  mottoSi: "",
  mottoEn: "",
}

interface Props {
  title?: string
  description?: string
}

export function HouseCrudPanel({ title = "Houses", description }: Props) {
  const { data: houses = [], isLoading } = useHouses()
  const createHouse = useCreateHouse()
  const updateHouse = useUpdateHouse()
  const deleteHouse = useDeleteHouse()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<House | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        nameSi: editing.nameSi,
        nameEn: editing.nameEn,
        color: editing.color,
        mottoSi: editing.mottoSi,
        mottoEn: editing.mottoEn,
      })
    } else {
      setForm(emptyForm)
    }
  }, [editing])

  const handleSubmit = async () => {
    if (editing) {
      await updateHouse.mutateAsync({ id: editing.id, payload: form })
    } else {
      await createHouse.mutateAsync(form)
    }
    setEditing(null)
    setForm(emptyForm)
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
              placeholder="e.g., Red House"
            />
          </div>
          <div className="space-y-2">
            <Label>Name (Sinhala)</Label>
            <Input
              value={form.nameSi}
              onChange={(e) => setForm((f) => ({ ...f, nameSi: e.target.value }))}
              placeholder="Local name"
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Input
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              placeholder="e.g., #ff0000 or Red"
            />
          </div>
          <div className="space-y-2">
            <Label>Motto (English)</Label>
            <Input
              value={form.mottoEn || ""}
              onChange={(e) => setForm((f) => ({ ...f, mottoEn: e.target.value }))}
              placeholder="Courage and honor"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Motto (Sinhala)</Label>
            <Input
              value={form.mottoSi || ""}
              onChange={(e) => setForm((f) => ({ ...f, mottoSi: e.target.value }))}
              placeholder="Localized motto"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={createHouse.isPending || updateHouse.isPending}>
            {editing ? "Update House" : "Create House"}
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
            <div className="p-4 text-sm text-muted-foreground">Loading houses...</div>
          ) : houses.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No houses created yet.</div>
          ) : (
            houses.map((house) => (
              <div key={house.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-slate-900">{house.nameEn}</p>
                  <p className="text-sm text-muted-foreground">
                    {house.nameSi} · Color: {house.color} {house.mottoEn ? `· ${house.mottoEn}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(house)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteHouse.mutate(house.id)}
                    disabled={deleteHouse.isPending}
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
