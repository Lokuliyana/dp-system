import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AttendanceStat {
  date: string
  gradeId: string
  gradeName?: string // We might need to map gradeId to name
  present: number
  absent: number
  late: number
  total: number
}

interface AttendanceMobileViewProps {
  stats: AttendanceStat[]
  grades: { id: string; nameEn: string }[]
}

export function AttendanceMobileView({ stats, grades }: AttendanceMobileViewProps) {
  // Group stats by grade
  const gradeStats = grades.map(grade => {
    const gradeRecords = stats.filter(s => s.gradeId === grade.id)
    const present = gradeRecords.reduce((acc, curr) => acc + curr.present, 0)
    const absent = gradeRecords.reduce((acc, curr) => acc + curr.absent, 0)
    const late = gradeRecords.reduce((acc, curr) => acc + curr.late, 0)
    const total = gradeRecords.reduce((acc, curr) => acc + curr.total, 0) // This might be sum of daily totals, so if range > 1 day, it's total student-days.
    
    return {
      ...grade,
      present,
      absent,
      late,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    }
  })

  return (
    <div className="space-y-4">
      {gradeStats.map(grade => (
        <Card key={grade.id} className="overflow-hidden">
          <CardHeader className="bg-slate-50 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{grade.nameEn}</CardTitle>
              <Badge variant={grade.percentage >= 75 ? "default" : "destructive"}>
                {grade.percentage}% Present
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-medium">{grade.percentage}%</span>
                </div>
                <Progress value={grade.percentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 p-2 rounded-md">
                  <div className="text-xl font-bold text-green-700">{grade.present}</div>
                  <div className="text-xs text-green-600">Present</div>
                </div>
                <div className="bg-red-50 p-2 rounded-md">
                  <div className="text-xl font-bold text-red-700">{grade.absent}</div>
                  <div className="text-xs text-red-600">Absent</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded-md">
                  <div className="text-xl font-bold text-yellow-700">{grade.late}</div>
                  <div className="text-xs text-yellow-600">Late</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
