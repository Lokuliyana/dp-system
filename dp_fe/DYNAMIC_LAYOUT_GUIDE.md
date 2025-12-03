# Dynamic Layout System Guide

This guide explains how to use the **Dynamic Layout System** to build complex, interactive interfaces like Student Management, Configuration, and House Meets.

## Core Concept: Inversion of Control

Unlike traditional layouts where the parent `layout.tsx` defines the sidebar and header, this system uses an **"Inversion of Control"** pattern.
- The **Parent** (`InnerLayout`) provides the "slots" (Sidebar, Top Bar, Right Bar).
- The **Page** (`LayoutController`) fills those slots with content.

This allows every page to have its own unique sidebar navigation and toolbar actions while sharing the same structural shell.

## Standard Components

Import these from `@/components/layout/dynamic`:

| Component | Purpose |
| :--- | :--- |
| `LayoutController` | Wraps your page content. Controls visibility of slots. |
| `DynamicPageHeader` | Standardized top bar with Title, Icon, and Actions. |
| `MainMenu` | The Sidebar container. |
| `VerticalToolbar` | The Right Sidebar container. |

---

## Scenario 1: Student Management (Drill-Down)

**Requirement**: Show all grades -> Click Grade -> Show Students -> Click Student -> Show Details.

### Step 1: The List Page (`/students/page.tsx`)
Displays the list of grades or students.

```tsx
export default function StudentListPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      {/* 1. Sidebar: Global Navigation */}
      <MainMenu>
        <MainMenuTitle>Students</MainMenuTitle>
        <MainMenuItem items={[{ text: "All Students", href: "/students", icon: <Users /> }]} />
      </MainMenu>

      {/* 2. Header: Page Title & Actions */}
      <DynamicPageHeader
        title="Student Directory"
        subtitle="Manage all student records"
        icon={Users}
        actions={<Button>Add Student</Button>}
      />

      {/* 3. Content: List of Grades/Students */}
      <div className="p-6">
        {/* ... Grade Cards or Student Table ... */}
      </div>
    </LayoutController>
  );
}
```

### Step 2: The Detail Page (`/students/[id]/page.tsx`)
Displays details for a single student. Note how the **Header** and **Sidebar** can change.

```tsx
export default function StudentDetailPage({ params }) {
  return (
    <LayoutController showMainMenu showHorizontalToolbar showVerticalToolbar>
      {/* 1. Sidebar: Can remain the same or show student-specific links */}
      <MainMenu>
         {/* ... same menu as list ... */}
      </MainMenu>

      {/* 2. Header: Specific to this Student */}
      <DynamicPageHeader
        title="John Doe"
        subtitle="Grade 10-A"
        icon={User}
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      {/* 3. Right Toolbar: Quick Actions for this Student */}
      <VerticalToolbar>
        <Button title="Edit Profile"><Edit /></Button>
        <Button title="View Grades"><GraduationCap /></Button>
      </VerticalToolbar>

      {/* 4. Content: Student Details */}
      <div className="p-6">
        {/* ... Student Profile Forms ... */}
      </div>
    </LayoutController>
  );
}
```

---

## Scenario 2: Configuration (Sub-Sections)

**Requirement**: Manage "Roles", "Permissions", "School Structure" under one Configuration module.

### Approach
Use the `MainMenu` as the navigation for the Configuration module.

```tsx
// app/configuration/roles/page.tsx
export default function RolesPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      {/* Sidebar acts as the Module Navigation */}
      <MainMenu>
        <MainMenuTitle>System Configuration</MainMenuTitle>
        <MainMenuItem
          items={[
            { text: "General", href: "/configuration/general", icon: <Settings /> },
            { text: "Roles & Permissions", href: "/configuration/roles", icon: <Shield /> },
            { text: "School Structure", href: "/configuration/structure", icon: <Building /> },
          ]}
        />
      </MainMenu>

      <DynamicPageHeader
        title="Roles & Permissions"
        subtitle="Manage system access levels"
        icon={Shield}
      />

      <div className="p-6">
        {/* Roles Table */}
      </div>
    </LayoutController>
  );
}
```

---

## Scenario 3: House Meets (Inner Navbar)

**Requirement**: A module with its own complex navigation (Dashboard, Events, Scores).

### Approach
Similar to Configuration, use `MainMenu` for the module's primary navigation. If you need tabs *within* a page (e.g., "Events" page has "Upcoming", "Past", "Results"), use standard UI Tabs inside the content area.

```tsx
export default function HouseMeetsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <MainMenu>
        <MainMenuTitle>House Meets</MainMenuTitle>
        <MainMenuItem
           items={[
             { text: "Dashboard", href: "/house-meets", icon: <LayoutDashboard /> },
             { text: "Events", href: "/house-meets/events", icon: <Calendar /> },
             { text: "Scoreboard", href: "/house-meets/scores", icon: <Trophy /> },
           ]}
        />
      </MainMenu>

      <DynamicPageHeader title="House Meets Dashboard" icon={Trophy} />

      <div className="p-6">
        {/* Content */}
      </div>
    </LayoutController>
  );
}
```

---

## Best Practices

1.  **Don't use `layout.tsx` for Sidebar**:
    Do **not** put the Sidebar in `app/configuration/layout.tsx`. If you do, it will be static. Instead, wrap `layout.tsx` with `InnerLayout` (the shell) and let each `page.tsx` inject its own `MainMenu`.

    **Correct `app/configuration/layout.tsx`**:
    ```tsx
    export default function Layout({ children }) {
      return <InnerLayout>{children}</InnerLayout>;
    }
    ```

2.  **Use `DynamicPageHeader`**:
    Always use this component for the top bar to ensure consistent spacing, icon sizing, and typography across the app.

3.  **Clean Up**:
    The `LayoutController` automatically cleans up (removes toolbars) when you navigate away, so you don't need to worry about "ghost" toolbars remaining.
