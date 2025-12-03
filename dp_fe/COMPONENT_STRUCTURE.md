# Component Structure Guide

This document outlines the organized component architecture for the School Management System.

## Directory Structure

\`\`\`
components/
├── common/                    # Shared UI & layout components
│   ├── app-shell.tsx         # Main app wrapper
│   ├── main-navigation.tsx   # Navigation menu
│   ├── theme-provider.tsx    # Theme configuration
│   ├── layout-controller.tsx # Layout control logic
│   └── index.ts              # Barrel export
│
├── reusable/                 # Project-wide reusable components
│   ├── page-header.tsx       # Page title & description
│   ├── page-container.tsx    # Page content wrapper
│   ├── grade-selector.tsx    # Grade selection component
│   ├── grade-tabs-navigation.tsx
│   ├── grade-navigator.tsx
│   ├── advanced-table.tsx    # Feature-rich table
│   ├── improved-dashboard.tsx
│   ├── student-summary-card.tsx
│   └── index.ts              # Barrel export
│
├── ui/                       # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── ... (all shadcn/ui components)
│   └── index.ts
│
├── students/                 # Student management page components
│   ├── student-details-page.tsx
│   ├── student-list-view.tsx
│   ├── student-registration-form.tsx
│   ├── student-dashboard.tsx
│   ├── inline-student-editor.tsx
│   ├── mobile-student-search.tsx
│   ├── basic-info.tsx        # Student info tab
│   ├── attendance-tab.tsx    # Student attendance tab
│   ├── talents.tsx           # Student talents tab
│   ├── notes.tsx             # Student notes tab
│   ├── roles.tsx             # Student roles tab
│   ├── talents-portfolio.tsx
│   └── index.ts              # Barrel export
│
├── attendance/               # Attendance management components
│   ├── attendance-tracker.tsx
│   ├── teacher-attendance-marking.tsx
│   └── index.ts              # Barrel export
│
├── analytics/                # Analytics page components
│   ├── analytics-dashboard.tsx
│   ├── enhanced-analytics-dashboard.tsx
│   ├── stats-grid.tsx
│   ├── student-metrics-card.tsx
│   ├── students-list-card.tsx
│   ├── performance-overview.tsx
│   ├── insights-section.tsx
│   ├── predictive-alerts.tsx
│   ├── report-builder.tsx
│   ├── comparative-analysis.tsx
│   └── index.ts              # Barrel export
│
├── house-meets/              # House meets page components
│   ├── house-meet-dashboard.tsx
│   ├── house-assignment-manager.tsx
│   ├── improved-house-meet-registration.tsx
│   ├── competition-results.tsx
│   ├── competition-registration.tsx
│   └── index.ts              # Barrel export
│
├── staff/                    # Staff management components
│   ├── teacher-registration.tsx
│   ├── responsibility-management.tsx
│   └── index.ts              # Barrel export
│
├── prefects/                 # Prefects management components
│   ├── prefects-management.tsx
│   └── index.ts              # Barrel export
│
├── clubs/                    # Clubs management components
│   ├── clubs-and-societies.tsx
│   └── index.ts              # Barrel export
│
├── competitions/             # Competitions management components
│   ├── competitions-management.tsx
│   └── index.ts              # Barrel export
│
├── parents/                  # Parents management components
│   ├── parents-management.tsx
│   └── index.ts              # Barrel export
│
├── shared-features/          # Shared feature components
│   ├── live-user-search.tsx
│   ├── enhanced-live-search.tsx
│   └── index.ts              # Barrel export
│
├── index.ts                  # Master barrel export
└── components.json           # shadcn/ui config
\`\`\`

## Import Patterns

### ✅ Correct Import Patterns

\`\`\`typescript
// From barrel exports (recommended)
import { AppShell, MainNavigation } from "@/components/common"
import { PageHeader, PageContainer } from "@/components/reusable"
import { StudentDetailsPage } from "@/components/students"
import { AttendanceTracker } from "@/components/attendance"

// From master barrel export
import { AppShell, StudentDetailsPage } from "@/components"

// Direct imports (when needed)
import { StudentDetailsPage } from "@/components/students/student-details-page"
\`\`\`

### ❌ Incorrect Import Patterns

\`\`\`typescript
// Don't import directly from component files that have barrel exports
import { AppShell } from "@/components/common/app-shell" // Wrong

// Don't import from deep nested paths when barrel exports exist
import { StudentDetailsPage } from "@/components/students/student-details-page" // Suboptimal
\`\`\`

## Component Categories

### 1. **Common Components** (`components/common/`)
Foundational components used across the entire application:
- `AppShell`: Main application wrapper with sidebar and layout
- `MainNavigation`: Sidebar navigation menu
- `ThemeProvider`: Theme and styling configuration
- `LayoutController`: Layout state management

**Usage:** Import in page layouts

### 2. **Reusable Components** (`components/reusable/`)
Project-specific reusable components used by multiple pages:
- `PageHeader`: Consistent page title headers
- `PageContainer`: Standard page content container
- `GradeSelector`: Grade selection interface
- `AdvancedTable`: Feature-rich data table with sorting, filtering, editing
- `ImprovedDashboard`: Dashboard overview component

**Usage:** Import across different pages and sections

### 3. **Page-Specific Components**
Components organized by page/feature:
- `components/students/` - Student management features
- `components/attendance/` - Attendance tracking features
- `components/analytics/` - Analytics and reporting
- `components/house-meets/` - Inter-house activities
- `components/staff/` - Staff management
- `components/prefects/` - Prefects and student leaders
- `components/clubs/` - Clubs and societies
- `components/competitions/` - Competition management
- `components/parents/` - Parents and guardians management

**Usage:** Import components from their respective page folder

### 4. **Shared Features** (`components/shared-features/`)
Components that are shared between multiple page sections:
- `LiveUserSearch`: Search and filter users dynamically
- `EnhancedLiveSearch`: Advanced search with live updates

**Usage:** Import when shared functionality is needed

### 5. **UI Components** (`components/ui/`)
Base shadcn/ui components:
- Button, Card, Input, Select, Dialog, etc.
- These are auto-generated and managed by shadcn/cli

**Usage:** Import as needed for UI building

## Page File Imports

Each app page file should import from organized component folders:

\`\`\`typescript
// app/students/page.tsx
import { AppShell } from "@/components/common"
import { PageHeader, PageContainer } from "@/components/reusable"
import { StudentDetailsPage } from "@/components/students"
import { Button } from "@/components/ui/button"
\`\`\`

## Adding New Components

When adding new components:

1. **Determine the category:**
   - Common UI wrapper? → `components/common/`
   - Project-wide reusable? → `components/reusable/`
   - Page-specific? → `components/{page-name}/`
   - Shared feature? → `components/shared-features/`

2. **Create the component file** in the appropriate folder

3. **Add to folder's `index.ts`** for barrel export

4. **Add to `components/index.ts`** for master barrel export

5. **Use the barrel export path** in imports

## Benefits of This Structure

- **Clarity**: Components are organized by their usage and scope
- **Maintainability**: Easy to locate components and their relationships
- **Scalability**: New page sections can follow the same pattern
- **Import Hygiene**: Barrel exports prevent deep import paths
- **Dependency Clarity**: Clear separation between common, reusable, and page-specific
- **Team Collaboration**: Clear guidelines for where to place components
