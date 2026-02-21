"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { analyticsService, OrganizationAnalytics, GradeAnalytics, StudentAnalytics } from "@/services/analytics.service"
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard"
import { PageHeader, PageContainer, LiveSearch } from "@/components/reusable"
import { Award, Users, GraduationCap, Building2, TrendingUp, Loader2 } from "lucide-react"
import { studentsService } from "@/services/students.service"
import { useGrades } from "@/hooks/useGrades"

export function AnalyticsDashboard() {
  const { data: gradesData } = useGrades()
  const grades = gradesData || []
  const [activeTab, setActiveTab] = useState("organization")
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [orgData, setOrgData] = useState<OrganizationAnalytics | null>(null)
  const [gradeData, setGradeData] = useState<GradeAnalytics | null>(null)
  const [studentData, setStudentData] = useState<StudentAnalytics | null>(null)

  // Selection states
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([])
  const [year, setYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    if (activeTab === "organization") {
      loadOrganizationData()
    }
  }, [activeTab, year])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getOrganization(year)
      setOrgData(data)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = async (gradeId: string) => {
    setSelectedGradeId(gradeId)
    if (!gradeId) return
    setLoading(true)
    try {
      const data = await analyticsService.getGrade(gradeId, year)
      setGradeData(data)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSearch = async (query: string) => {
    if (!query) return;
    const res = await studentsService.list({ search: query, limit: 10 });
    setStudentSearchResults(res.items.map(s => ({ 
        ...s, 
        id: s.id, 
        displayName: `${s.admissionNumber} - ${s.nameWithInitialsSi || s.fullNameEn}` 
    })));
  }

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudentId(studentId)
    if (!studentId) return
    setLoading(true)
    try {
      const data = await analyticsService.getStudent(studentId, year)
      setStudentData(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Analytics"
        description="Comprehensive performance and attendance overview across the organization"
        icon={<TrendingUp className="h-6 w-6" />}
      />

      <PageContainer>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="organization" className="gap-2 text-md">
              <Building2 className="h-4 w-4" /> Organization
            </TabsTrigger>
            <TabsTrigger value="grade" className="gap-2 text-md">
              <GraduationCap className="h-4 w-4" /> Grade Wise
            </TabsTrigger>
            <TabsTrigger value="student" className="gap-2 text-md">
              <Users className="h-4 w-4" /> Student Wise
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization">
            {loading ? (
              <LoadingState />
            ) : orgData && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnalyticsSummaryCard 
                  distribution={orgData.distribution} 
                  totalStudents={orgData.totalStudents} 
                  title="Whole Organization"
                />
                
                <Card className="md:col-span-2 shadow-lg border-2">
                  <CardHeader>
                    <CardTitle>Grade-wise Distribution</CardTitle>
                    <CardDescription>Performance breakdown by grade level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orgData.gradeWise.map(g => (
                        <div key={g.gradeId} className="flex items-center gap-4">
                          <div className="w-24 font-bold text-sm">{g.gradeName}</div>
                          <div className="flex-1 flex h-6 rounded-md overflow-hidden bg-slate-100">
                            {g.distribution.best > 0 && <div className="bg-green-600" style={{ width: `${(g.distribution.best / g.studentCount) * 100}%` }} title="Best" />}
                            {g.distribution.good > 0 && <div className="bg-blue-600" style={{ width: `${(g.distribution.good / g.studentCount) * 100}%` }} title="Good" />}
                            {g.distribution.normal > 0 && <div className="bg-yellow-600" style={{ width: `${(g.distribution.normal / g.studentCount) * 100}%` }} title="Normal" />}
                            {g.distribution.weak > 0 && <div className="bg-red-600" style={{ width: `${(g.distribution.weak / g.studentCount) * 100}%` }} title="Weak" />}
                          </div>
                          <div className="w-12 text-right text-xs font-bold text-muted-foreground">{g.studentCount}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Grade Tab */}
          <TabsContent value="grade">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <label className="text-sm font-bold mb-2 block">Select Grade</label>
                  <LiveSearch
                    data={grades.map(g => ({ ...g, displayName: g.nameEn }))}
                    labelKey="displayName"
                    valueKey="id"
                    onSearch={() => {}}
                    selected={(valInfo) => handleGradeChange(valInfo.value || "")}
                    placeholder="Search grade..."
                  />
                </CardContent>
              </Card>

              {loading ? (
                <LoadingState />
              ) : gradeData ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <AnalyticsSummaryCard 
                    distribution={gradeData.distribution} 
                    totalStudents={gradeData.studentCount} 
                    title={`Grade: ${grades.find(g => g.id === selectedGradeId)?.nameEn || "Selected Grade"}`}
                  />
                  
                  <Card className="shadow-lg border-2">
                    <CardHeader>
                      <CardTitle>Grade Averages</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around items-center h-48">
                       <MetricCircle label="Attendance" value={gradeData.averages.attendancePct} unit="%" color="green" />
                       <MetricCircle label="Mark Average" value={gradeData.averages.markAvg} unit="" color="blue" />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <EmptyState icon={<GraduationCap className="h-12 w-12" />} message="Please select a grade to view analytics" />
              )}
            </div>
          </TabsContent>

          {/* Student Tab */}
          <TabsContent value="student">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <label className="text-sm font-bold mb-2 block">Search Student</label>
                  <LiveSearch
                    data={studentSearchResults}
                    onSearch={handleStudentSearch}
                    labelKey="displayName"
                    valueKey="id"
                    selected={(valInfo) => handleStudentChange(valInfo.value || "")}
                    placeholder="Enter student name or admission number..."
                  />
                </CardContent>
              </Card>

              {loading ? (
                <LoadingState />
              ) : studentData ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="shadow-lg border-2 overflow-hidden">
                     <div className={`p-4 text-center font-bold text-white uppercase tracking-widest ${getCategoryColor(studentData.category)}`}>
                        {studentData.category}
                     </div>
                     <CardContent className="pt-6 text-center space-y-4">
                        <Award className={`h-16 w-16 mx-auto ${getCategoryTextColor(studentData.category)}`} />
                        <div className="text-2xl font-bold">Performance Category</div>
                        <p className="text-muted-foreground text-sm px-4">Based on attendance and academic results for {year}</p>
                     </CardContent>
                  </Card>

                  <Card className="md:col-span-2 shadow-lg border-2">
                    <CardHeader>
                      <CardTitle>Detailed Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-8 pt-4">
                       <MetricDetail label="Attendance Percentage" value={studentData.metrics.attendancePct} unit="%" subValue={`${studentData.metrics.presentCount}/${studentData.metrics.attendanceCount} days present`} />
                       <MetricDetail label="Academic Average" value={studentData.metrics.markAvg} unit="" subValue={`Calculated from ${studentData.metrics.examCount} exams`} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <EmptyState icon={<Users className="h-12 w-12" />} message="Please search for a student to view analytics" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-muted-foreground font-medium">Fetching analytics data...</p>
    </div>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 border-2 border-dashed rounded-xl bg-slate-50">
      <div className="text-slate-300">{icon}</div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  )
}

function MetricCircle({ label, value, unit, color }: { label: string, value: number, unit: string, color: "green" | "blue" }) {
  const colorMap = {
    green: "text-green-600 border-green-200 bg-green-50",
    blue: "text-blue-600 border-blue-200 bg-blue-50"
  }
  return (
    <div className="text-center space-y-2">
      <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${colorMap[color]}`}>
        <span className="text-3xl font-black">{Math.round(value)}{unit}</span>
      </div>
      <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  )
}

function MetricDetail({ label, value, unit, subValue }: { label: string, value: number, unit: string, subValue: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-bold text-muted-foreground uppercase">{label}</div>
      <div className="text-4xl font-black">{value}{unit}</div>
      <div className="text-sm text-slate-500 font-medium italic">{subValue}</div>
    </div>
  )
}

function getCategoryColor(category: string) {
  switch (category) {
    case "best": return "bg-green-600";
    case "good": return "bg-blue-600";
    case "normal": return "bg-yellow-600";
    case "weak": return "bg-red-600";
    default: return "bg-slate-600";
  }
}

function getCategoryTextColor(category: string) {
  switch (category) {
    case "best": return "text-green-600";
    case "good": return "text-blue-600";
    case "normal": return "text-yellow-600";
    case "weak": return "text-red-600";
    default: return "text-slate-600";
  }
}
