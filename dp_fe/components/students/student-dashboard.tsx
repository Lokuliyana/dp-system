"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, TrendingUp, Award, BookOpen, Clock, UserCheck } from "lucide-react"
import { type Student, GRADES } from "@/lib/school-data"

interface StudentDashboardProps {
  students: Student[]
  selectedGrade?: string
}

export function StudentDashboard({ students, selectedGrade }: StudentDashboardProps) {
  // Filter students by grade if selected
  const dashboardStudents = selectedGrade ? students.filter((s) => {
    const sGradeId = (s.gradeId && typeof s.gradeId === 'object') ? (s.gradeId as any)._id : s.gradeId
    return sGradeId === selectedGrade
  }) : students

  // Calculate statistics
  const stats = {
    totalStudents: dashboardStudents.length,
    activeStudents: dashboardStudents.filter((s) => s.status === "active").length,
    totalGrades: GRADES.length,
    excellentPerformance: dashboardStudents.filter((s) => s.academicPerformance === "excellent").length,
  }

  const performanceData = {
    excellent: dashboardStudents.filter((s) => s.academicPerformance === "excellent").length,
    good: dashboardStudents.filter((s) => s.academicPerformance === "good").length,
    average: dashboardStudents.filter((s) => s.academicPerformance === "average").length,
    needsImprovement: dashboardStudents.filter((s) => s.academicPerformance === "needs-improvement").length,
  }

  const performanceChartData = [
    { name: "Excellent", value: performanceData.excellent, fill: "#10b981" },
    { name: "Good", value: performanceData.good, fill: "#3b82f6" },
    { name: "Average", value: performanceData.average, fill: "#f59e0b" },
    { name: "Needs Improvement", value: performanceData.needsImprovement, fill: "#ef4444" },
  ]

  const statusData = [
    { name: "Active", value: dashboardStudents.filter((s) => s.status === "active").length, fill: "#10b981" },
    { name: "Inactive", value: dashboardStudents.filter((s) => s.status === "inactive").length, fill: "#6b7280" },
  ]

  // Grade-wise student count
  const gradeWiseData = GRADES.map((grade) => ({
    name: grade.name,
    students: students.filter((s) => {
      const sGradeId = (s.gradeId && typeof s.gradeId === 'object') ? (s.gradeId as any)._id : s.gradeId
      return sGradeId === grade.id
    }).length,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Students</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeStudents}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Excellent Performance</p>
                <p className="text-3xl font-bold text-slate-900">{stats.excellentPerformance}</p>
              </div>
              <Award className="h-12 w-12 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Grades</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalGrades}</p>
              </div>
              <BookOpen className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Academic Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Status Distribution */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-slate-600" />
              Student Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade-wise Student Count */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-600" />
              Students per Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeWiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{item.value}</span>
                  <span className="text-sm text-slate-600">
                    ({Math.round((item.value / stats.totalStudents) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
