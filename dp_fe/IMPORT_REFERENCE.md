# Quick Import Reference Guide

## Common Components (Shared UI & Layout)

\`\`\`typescript
import { AppShell, MainNavigation, ThemeProvider } from "@/components/common"
\`\`\`

**When to use:** In layout files, page wrappers, global app structure

## Reusable Components (Project-wide utilities)

\`\`\`typescript
import { 
  PageHeader, 
  PageContainer, 
  GradeSelector, 
  GradeTabsNavigation,
  AdvancedTable,
  ImprovedDashboard 
} from "@/components/reusable"

import type { TableColumn, RowDecoration } from "@/components/reusable"
\`\`\`

**When to use:** In multiple pages, general purpose UI building

## Students Page Components

\`\`\`typescript
import { 
  StudentDetailsPage, 
  StudentListView, 
  StudentRegistrationForm,
  StudentDashboard 
} from "@/components/students"
\`\`\`

**File:** `app/students/page.tsx`

## Attendance Page Components

\`\`\`typescript
import { AttendanceTracker, TeacherAttendanceMarking } from "@/components/attendance"
\`\`\`

**Files:** `app/attendance/page.tsx`, `app/attendance-marking/page.tsx`

## Analytics Page Components

\`\`\`typescript
import { AnalyticsDashboard } from "@/components/analytics"
\`\`\`

**File:** `app/analytics/page.tsx`

## House Meets Page Components

\`\`\`typescript
import { 
  HouseMeetDashboard, 
  HouseAssignmentManager,
  CompetitionResults 
} from "@/components/house-meets"
\`\`\`

**File:** `app/house-meets/page.tsx`

## Staff Page Components

\`\`\`typescript
import { TeacherRegistration, ResponsibilityManagement } from "@/components/staff"
\`\`\`

**File:** `app/staff/page.tsx`

## Prefects Page Components

\`\`\`typescript
import { PrefectsManagement } from "@/components/prefects"
\`\`\`

**File:** `app/prefects/page.tsx`

## Clubs Page Components

\`\`\`typescript
import { ClubsAndSocieties } from "@/components/clubs"
\`\`\`

**File:** `app/clubs/page.tsx`

## Competitions Page Components

\`\`\`typescript
import { CompetitionsManagement } from "@/components/competitions"
\`\`\`

**File:** `app/competitions/page.tsx`

## Parents Page Components

\`\`\`typescript
import { ParentsManagement } from "@/components/parents"
\`\`\`

**File:** `app/parents/page.tsx`

## Shared Features

\`\`\`typescript
import { LiveUserSearch, EnhancedLiveSearch } from "@/components/shared-features"
import type { SearchableUser } from "@/components/shared-features"
\`\`\`

**When to use:** When multiple pages need search/filter functionality

## UI Components (shadcn/ui)

\`\`\`typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
\`\`\`

## Master Barrel Export

You can also import from the main components index:

\`\`\`typescript
import { 
  AppShell, 
  PageHeader, 
  StudentDetailsPage,
  AttendanceTracker 
} from "@/components"
\`\`\`

## Migration Checklist

When updating old imports to the new structure:

- [ ] `@/components/app-shell` → `@/components/common`
- [ ] `@/components/page-header` → `@/components/reusable`
- [ ] `@/components/page-container` → `@/components/reusable`
- [ ] `@/components/grade-selector` → `@/components/reusable`
- [ ] `@/components/student-details-page` → `@/components/students`
- [ ] `@/components/attendance-tracker` → `@/components/attendance`
- [ ] `@/components/teacher-registration` → `@/components/staff`
- [ ] `@/components/live-user-search` → `@/components/shared-features`
