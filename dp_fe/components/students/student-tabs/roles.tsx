"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import type { Student } from "@/lib/school-data"
import { Badge } from "@/components/ui"

interface StudentRolesProps {
  student: Student
}

export function StudentRoles({ student }: StudentRolesProps) {
  const [roles] = useState({
    isPrefect: Math.random() > 0.7,
    rank: ["prefect", "vice-prefect", "head-prefect"][Math.floor(Math.random() * 3)],
    clubs: [
      { name: "Science Club", role: "member" },
      { name: "Debate Society", role: "president" },
    ],
    houseMeet: {
      houseName: ["Red House", "Blue House", "Green House", "Yellow House"][Math.floor(Math.random() * 4)],
      position: "member",
    },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prefect Status</CardTitle>
        </CardHeader>
        <CardContent>
          {roles.isPrefect ? (
            <div className="space-y-3">
              <Badge className="capitalize">{roles.rank}</Badge>
              <p className="text-sm text-slate-600">
                This student holds the position of {roles.rank.replace("-", " ")} in their grade.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Not a prefect</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>House Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">House:</span> {roles.houseMeet.houseName}
            </p>
            <p className="text-sm capitalize">
              <span className="font-medium">Position:</span> {roles.houseMeet.position}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Club Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          {roles.clubs.length > 0 ? (
            <div className="space-y-3">
              {roles.clubs.map((club, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{club.name}</p>
                    <p className="text-xs text-slate-600 capitalize">{club.role}</p>
                  </div>
                  <Badge variant="outline">{club.role}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No club memberships</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
