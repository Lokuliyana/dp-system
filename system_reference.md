# System Reference Document

## 1. Core Academic Structure

### 1.1 Grades
There are Grades from 1 ශ්‍රේණිය / Grade 1 up to Grade 14.
Each Grade is a single class with exactly one Class Teacher (පන්ති භාර) at a time.
Students move grade-to-grade automatically each year based on DOB.

**Data needs**
- Grade name Sinhala + English (nameSi, nameEn)
- Grade level (1–14)
- current classTeacherId
- pastTeachers history (year ranges)

### 1.2 Sections
Grades belong to one Section:
- Primary / ප්‍රාථමික: Grades 1–6
- Junior / කණිෂ්ඨ: Grades 7–9
- Senior / ජ්‍යේෂ්ඨ: Grades 10–14

**Data needs**
- Section name Sinhala + English
- assignedGradeIds

**Behavior**
- A Grade can only be in one Section.
- Student.section is derived from Grade.section (not manually edited).

## 2. Houses (House Meet Foundation)
There are 4 houses:
- මෙත්තා / Meththa
- කරුණා / Karuna
- මුදිතා / Muditha
- උපේක්ඛා / Upekka

House assignments reset yearly.
Teachers are also assigned to houses yearly (for house leadership/admin).

**Data needs**
- House master (nameSi/nameEn, color, motto)
- Yearly StudentHouseAssignment: studentId, gradeId snapshot, year, houseId
- Yearly TeacherHouseAssignment: teacherId, year, houseId

## 3. Societies → Competitions Hierarchy

### 3.1 Societies
Societies are basically competition sources and eligibility rules.
Examples:
- Daham Danuma Junior (Grades 1–6)
- Daham Danuma Senior (Grades 7–14)
- Oratory (Grades 6–14)
- Pali Gatha Gayana (Grades 7–14)
- Padya Gayana (Grades 7–14)
- Gadya Rachana (Grades 7–14)
- Art (section-wise Primary–Senior)
- Maw Guna Gee Gayana (section-wise Primary–Senior)

**Interpretation**
- A Society defines what competitions exist and who is eligible.
- Societies are attached to Houses (house-wise competition structure).

**Data needs**
- Squad (Society ≈ Squad)
- nameSi/nameEn
- scope = grade/section/all
- gradeIds or sectionIds depending on scope

### 3.2 Competitions
Competitions are created under Squads.
There are:
- Main 41 competitions (grade/section scoped, house-based quota applies)
- Other competitions
    - Drama (team)
    - Singing (single + team)
    - etc.

**Competition eligibility:**
- open: any student can join
- grade-based
- section-based

**House registration rule**
For house-based competitions:
- per grade, 2 students per house
- 4 houses ⇒ max 8 house participants per grade

**Independent registrations:**
- any number of students can register without house quota.

**Special case:**
- Primary Art (Grades 1–6): only 2 via houses, still can allow independents if you decide, but your rule says houses-only cap.

**Data needs**
- Competition: nameSi/nameEn, squadId, scope (open/grade/section), gradeIds/sectionIds, year, mainClubIds optional
- CompetitionHouseRule: competitionId, year, maxPerHousePerGrade=2 (and any special overrides)
- CompetitionRegistration: competitionId, year, studentId, gradeId snapshot, houseId optional (null = independent)
- CompetitionResult: competitionId, year, place 1–5
    - if single: store studentId + houseId snapshot
    - if team-based: store houseId only (studentId null)

### 3.3 House Marks & Winning House
Marks given only for 1st–3rd places:
- 1st = 15
- 2nd = 10
- 3rd = 5

Winning house per year is computed by summing marks from results.

**Behavior**
- System must compute: per-competition house points, overall house leaderboard per year

## 4. Higher-Level Teams (Zonal → District → All Island)
Levels:
- Zonal (ශාසනාරක්ෂක)
- District (දිස්ත්‍රික්)
- All Island (සමස්ථ ලංකා)

### 4.1 Zonal Team Selection
From the 41 main competitions, you select one representative per competition.
Not always automatic because:
- one student can win max 3 competitions
- so selection is manual

**System should:**
- suggest the 1st-place student per competition
- allow manual override

**Zonal results:**
- place 1–5 earns team marks: 1st=5, 2nd=4, 3rd=3, 4th=2, 5th=1
- Store: selected entries, totalMarks, teamPosition

### 4.2 District Team Auto-creation
Automatically create District team from Zonal winners:
- take all Zonal 1st-place entries
- Same data stored as Zonal.

### 4.3 All Island Auto-creation
Automatically create All Island team from District winners:
- take all District 1st-place entries
- Same data stored.

**Data needs**
- Unified TeamSelection model:
    - level enum (zonal/district/allisland)
    - year
    - entries[]: (competitionId, studentId, place)
    - totalMarks
    - teamPosition
- Auto-creation happens in service logic, not schema.

## 5. Attendance (Sunday-only)
Dhamma school runs only on Sundays.
Every Sunday, each Grade’s attendance is marked.

**Rules**
- Only two states: present / absent.
- Must prevent duplicates for same student/date.
- Attendance history visible per student across years.
- System must analyze attendance severity: critical / medium / normal / good / better (your scale)

**Data needs**
- Attendance: studentId, gradeId snapshot, date (Sunday), status, recordedById, academicYear/year

## 6. Exams & Grading
Each year has 3 terms / 3 exams.
Results recorded grade-wise for each term.

**Grading schema like:**
- විශිෂ්ඨ (distinction)
- සමත් (pass)
- අසමත් (fail)

**Behavior**
- Record marks per student per term per grade per year.
- Attach grading schema per result.
- Show all past term results within student profile.
- Use marks + attendance together to classify student performance stage.

**Data needs**
- GradingSchema: nameSi/nameEn, minMarks, maxMarks
- ExamResult: year, term, gradeId, results[] with studentId, mark, gradingSchemaId

## 7. Teachers, Roles, Hierarchy

### 7.1 Teacher Roles (positions)
Roles can be:
- grade-based single (class teacher)
- grade-based multiple (section head)
- all-grades (principal, discipline head, exam admin)
- society-based (art society head, etc.)

One role can have multiple teachers.
Teachers can hold multiple roles.
Roles may also have rank ordering among assigned teachers.

**Data needs**
- StaffRole master: nameSi/nameEn, gradeBased boolean, singleGraded boolean, gradesEffected, responsibilities[], descriptionSi/En
- Teacher: names Si/En, fullName Si/En, dob, dateJoined, email, phone, roleIds[], pastRoles[], qualifications[], status

**Behavior**
- Assign teacher(s) to role(s) with optional internal ordering.

### 7.2 MIC & Squad linkage
Teachers can be:
- MICs for Clubs (multiple MICs allowed)
- assigned to Squads (society leadership)

## 8. Clubs & Student Positions
Clubs have:
- multiple MIC teachers
- their own club-specific student positions (global or club-specific)

**Data needs**
- ClubPosition master: nameSi/nameEn, responsibilitySi/En
- Club: nameSi/nameEn, descriptionsSi/En, founded month/year, micTeacherIds[], memberships[] embedded (studentId, positionId, dateJoined, leftDate, starLevel)

**Behavior**
- Membership history must be visible per student.

## 9. Events
Events can be created under: Clubs, Squads (societies), Staff, Academic, Regular
Optional student registration for events with: remark, star level (1/2/3), short note

**Data needs**
- Event: titleSi/titleEn, descriptionSi/En, category, clubId optional, squadId optional, startDate, endDate, year
- EventRegistration: eventId, studentId, gradeId snapshot, starLevel 1/2/3, note/remark

## 10. Prefects
Prefect positions have: rank levels, responsibilities, multiple positions can share same rank
Every prefect also belongs to a major tier: Primary / Junior / Senior / Head Prefect / Deputy Head Prefect
Each appointed prefect: has a rank (prefect/vice/head), has multiple PrefectPositions (duties)

**Data needs**
- PrefectPosition: nameSi/nameEn, responsibilitySi/En, descriptionSi/En, rankLevel number
- Prefect yearly appointments: year, appointedDate, students[] (studentId, rank, positionIds[])

**Behavior**
- Prefect history visible per student.

## 11. Student-Centered 360° View
For any selected student and any year:
- Basic info
- Attendance history (Sunday-only)
- Exam history (3 terms per year)
- House history
- Competition registrations + wins
- Zonal/district/allisland participation + wins
- Club memberships + positions
- Prefect history
- Event participation (if enabled)

## 12. Reporting & Analytics
System must generate summaries:
- Per student: attendance %, absent-risk, exam trend, competitions & awards
- Per grade: total students, attendance trend, top performers, house contribution
- Per teacher: roles held, grade responsibility years, MIC/squad leadership
- House leaderboard: points by competition, total yearly points
- Team performance: zonal/district/allisland totalMarks & positions

## Summary
Your system is a Sinhala Dhamma school admin platform where:
- Grades/Sections structure is fixed
- Students auto-promote yearly
- Houses + Societies drive the competition ecosystem
- House meets include strict quotas + independent entries
- Results feed house scoring and higher-level team pipelines
- Attendance is Sunday-only and risk-scored
- Exams are term-based with Sinhala grading labels
- Teachers and Prefects have hierarchical multi-role setups
- Student is the center: everything must be visible year-wise
- Reports summarize student/grade/teacher/house/team performance
- English labels must exist alongside Sinhala labels everywhere for search and indexing
