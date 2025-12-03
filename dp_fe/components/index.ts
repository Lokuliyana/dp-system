// Common UI & Layout Components
export { AppShell, MainNavigation, ThemeProvider, LayoutController } from "./layout"

// Reusable Project Components
export { PageHeader, PageContainer } from "./layout"
export { GradeSelector, GradeTabsNavigation, GradeNavigator, AdvancedTable } from "./shared"
export { ImprovedDashboard } from "./analytics"
export { StudentSummaryCard } from "./students"
export type { TableColumn, RowDecoration } from "./shared"

// Page-Specific: Students
export { StudentDetailsPage, StudentListView, StudentRegistrationForm } from "./students"
export { StudentDashboard, InlineStudentEditor, MobileStudentSearch } from "./students"
export { TalentsPortfolio } from "./students"

// Page-Specific: Analytics
export { AnalyticsDashboard, EnhancedAnalyticsDashboard } from "./analytics"

// Page-Specific: House Meets
export { HouseMeetDashboard, HouseAssignmentManager } from "./house-meets"
export { ImprovedHouseMeetRegistration, CompetitionResults } from "./house-meets"

// Page-Specific: Staff
export { TeacherRegistration, ResponsibilityManagement, TeacherHouseAssignments } from "./staff"

// Page-Specific: Prefects
export { PrefectsManagement } from "./prefects"

// Page-Specific: Clubs
export { ClubsAndSocieties } from "./clubs"

// Page-Specific: Events
export { EventsManagement } from "./events"

// Page-Specific: Parents
export { ParentsManagement } from "./parents"

// Shared Features
export { LiveUserSearch, EnhancedLiveSearch } from "./shared"
export type { SearchableUser } from "./shared"
