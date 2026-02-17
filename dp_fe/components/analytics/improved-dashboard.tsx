"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Trophy,
  Award,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Header,
} from "@/components/ui";

type DashboardStat = {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  trend: string;
};

type GradePerformanceRow = {
  grade: string;
  excellent: number;
  good: number;
  average: number;
  poor: number;
};

type RecentActivity = {
  title: string;
  time: string;
  type: "competition" | "clubs" | "event" | "alert";
};

const dashboardStats: DashboardStat[] = [
  {
    title: "Total Students",
    value: "455",
    icon: Users,
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
    trend: "+12 this month",
  },
  {
    title: "Competitions",
    value: "12",
    icon: Trophy,
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
    trend: "3 ongoing",
  },
  {
    title: "Clubs & Activities",
    value: "18",
    icon: Award,
    colorClass: "bg-purple-50 text-purple-700 border-purple-200",
    trend: "456 members",
  },
  {
    title: "Overall Attendance",
    value: "94%",
    icon: TrendingUp,
    colorClass: "bg-green-50 text-green-700 border-green-200",
    trend: "↑2% from last week",
  },
];

const gradePerformance: GradePerformanceRow[] = [
  { grade: "Grade 1", excellent: 15, good: 18, average: 8, poor: 2 },
  { grade: "Grade 2", excellent: 12, good: 20, average: 10, poor: 3 },
  { grade: "Grade 3", excellent: 18, good: 16, average: 9, poor: 2 },
  { grade: "Grade 4", excellent: 14, good: 19, average: 11, poor: 1 },
  { grade: "Grade 5", excellent: 16, good: 17, average: 10, poor: 2 },
  { grade: "Grade 6", excellent: 13, good: 21, average: 8, poor: 3 },
];

const recentActivities: RecentActivity[] = [
  { title: "Debate Competition Results", time: "2 hours ago", type: "competition" },
  { title: "New Club Registration", time: "4 hours ago", type: "clubs" },
  { title: "Class Teacher Conference", time: "1 day ago", type: "event" },
  { title: "Attendance Alert", time: "1 day ago", type: "alert" },
];

// Motion presets
const sectionFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const listContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

export function ImprovedDashboard() {
  return (
    <div className="space-y-8">
      {/* School Overview + Key metrics */}
      <motion.div
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18 }}
        className="space-y-6"
      >
        <Header
          icon={BarChart3}
          title="Sri Ananda Overview"
          description="High-level view of student numbers, activities, performance, and operational alerts."
          variant="page"
          actions={
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                Today&apos;s snapshot
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                Updated: 5 mins ago
              </span>
            </div>
          }
        />

        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 px-6"
        >
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.title} variants={listItem}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {stat.title}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {stat.trend}
                        </p>
                      </div>
                      <div
                        className={`${stat.colorClass} border inline-flex h-10 w-10 items-center justify-center rounded-lg`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Performance + Quick actions */}
      <motion.div
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3 px-6"
      >
        <div className="lg:col-span-2 space-y-4">
          <Header
            title="Performance by grade"
            description="Distribution of students by performance band across grades."
            variant="section"
          />
          <Card>
            <CardHeader>
              <CardTitle>Academic performance distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradePerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="grade"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <Tooltip 
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Legend />
                    <Bar dataKey="excellent" fill="#22c55e" name="Excellent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="good" fill="#3b82f6" name="Good" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="average" fill="#f59e0b" name="Average" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="poor" fill="#ef4444" name="Needs improvement" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Header
            title="Quick actions"
            description="Frequently used operations."
            variant="section"
          />
          <Card>
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickActionButton
                icon={Trophy}
                label="Register competition"
                description="Create or update competition records."
                colorClass="border-blue-200 bg-blue-50 hover:bg-blue-100"
                iconClass="text-blue-600"
              />
              <QuickActionButton
                icon={Award}
                label="Manage clubs"
                description="Update club profiles and member lists."
                colorClass="border-purple-200 bg-purple-50 hover:bg-purple-100"
                iconClass="text-purple-600"
              />
              <QuickActionButton
                icon={Users}
                label="View parents"
                description="Access parent directory."
                colorClass="border-amber-200 bg-amber-50 hover:bg-amber-100"
                iconClass="text-amber-600"
              />
              <QuickActionButton
                icon={Calendar}
                label="Schedule events"
                description="Plan school events and key dates."
                colorClass="border-green-200 bg-green-50 hover:bg-green-100"
                iconClass="text-green-600"
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recent activity + alerts */}
      <motion.div
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 px-6"
      >
        <div className="space-y-4">
          <Header
            title="Recent activity"
            description="Latest updates from competitions, clubs, and academic events."
            variant="section"
          />
          <Card>
            <CardHeader>
              <CardTitle>Activity log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {recentActivities.map((activity, idx) => (
                <motion.div
                  key={`${activity.title}-${idx}`}
                  variants={listItem}
                  className="flex items-start gap-4 border-b border-slate-100 py-3 last:border-b-0 last:pb-0 first:pt-0"
                >
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Header
            title="Operational alerts"
            description="Key items requiring follow-up from staff."
            variant="section"
          />
          <Card>
            <CardHeader>
              <CardTitle>Alerts & notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AlertBlock
                title="Attendance below 75%"
                body="8 students flagged for review."
                colorClass="bg-red-50 border-red-200"
                textClass="text-red-900"
              />
              <AlertBlock
                title="Upcoming competition"
                body="Debate competition starts in 3 days."
                colorClass="bg-amber-50 border-amber-200"
                textClass="text-amber-900"
              />
              <AlertBlock
                title="Parent conferences scheduled"
                body="5 meetings planned for next week."
                colorClass="bg-blue-50 border-blue-200"
                textClass="text-blue-900"
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  colorClass: string;
  iconClass: string;
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  colorClass,
  iconClass,
}: QuickActionButtonProps) {
  return (
    <motion.button
      type="button"
      variants={listItem}
      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all hover:shadow-sm ${colorClass}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 ${iconClass}`} />
        <div>
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 text-xs text-slate-600">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

interface AlertBlockProps {
  title: string;
  body: string;
  colorClass: string;
  textClass: string;
}

function AlertBlock({ title, body, colorClass, textClass }: AlertBlockProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${colorClass}`}
    >
      <p className={`font-semibold ${textClass}`}>{title}</p>
      <p className="mt-1 text-xs text-slate-800">{body}</p>
    </div>
  );
}
