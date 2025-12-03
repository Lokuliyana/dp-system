# High-Level Backend Technical Plan  
### (Mapped Model-wise + Requirement-wise F1–F42)

---

## 0. Technical Stack & Architecture (Optimized)

**Stack:** Node.js, Express/NestJS, MongoDB, Mongoose  
**Folders:**  
- `models/` → Mongoose schemas  
- `services/` → core business logic  
- `controllers/` → request handling  
- `routes/` → REST endpoints  
- `jobs/` → cron tasks (promotion, pipeline)  
- `middlewares/` → auth, RBAC, validation  
- `utils/` → scoring, date helpers

**Tenant isolation:** Each model includes `schoolId`, auto-injected via auth context.  
**RBAC:** `requireRole()` + fine-grained permissions.  

**Indexes:** Added per read-path to support performance in dashboards + reports.  

---

# 1. Model-wise Backend Functions

Below are *only* the functions needed per model (no descriptions).  
If a requirement is fulfilled by another model, I note it.

---

## Section
- createSection  
- listSections  
- updateSection  
- deleteSection  

---

## Grade
- createGrade  
- listGradesWithStats  
- updateGrade  
- deleteGrade  

---

## Student
- createStudent  
- listStudentsByGrade  
- updateStudentBasicInfo  
- deleteStudent  
- addStudentNote  
- removeStudentNote  
- getStudent360  

---

## StudentTalent
- createTalent  
- listTalentsByStudent  
- updateTalent  
- deleteTalent  

---

## Attendance
- markAttendanceBatch  
- listAttendanceByStudent  
- listAttendanceByGradeAndSunday  
- computeAttendanceRisk  

---

## House
- createHouse  
- listHouses  
- updateHouse  
- deleteHouse  

---

## StudentHouseAssignment
- assignStudentHouse  
- listHouseAssignments  

---

## TeacherHouseAssignment
- assignTeacherHouse  
- listTeacherHouseAssignments  

---

## Squad
- createSquad  
- listSquads  
- updateSquadEligibility  
- deleteSquad  

---

## Competition
- createCompetition  
- listCompetitions  
- updateCompetition  
- deleteCompetition  

---

## CompetitionHouseRule
- upsertHouseRule  
- getHouseRule  

---

## CompetitionRegistration
- registerHouseParticipant  
- registerIndependentParticipant  
- removeRegistration  
- listRegistrations  

---

## CompetitionTeam
- createTeam  
- updateTeamMembers  
- deleteTeam  
- listTeams  

---

## CompetitionResult
- recordResults  
- removeResultEntry  
- listResults  
- computeHousePoints  

---

## TeamSelection
- getZonalSuggestions  
- saveTeamSelection  
- computeTeamTotalMarks  
- autoGenerateNextLevel  

---

## GradingSchema
- createGradingSchema  
- listGradingSchemas  
- updateGradingSchema  
- deleteGradingSchema  

---

## ExamResult
- createExamResultSheet  
- upsertExamResults  
- listExamResultsByStudent  
- listExamResultsByGrade  

---

## StaffRole
- createStaffRole  
- listStaffRoles  
- updateStaffRole  
- deleteStaffRole  
- assignTeachersToRole  

---

## Teacher
- createTeacher  
- listTeachers  
- updateTeacher  
- deleteTeacher  
- appendPastRole  

---

## ClubPosition
- createClubPosition  
- listClubPositions  
- updateClubPosition  
- deleteClubPosition  

---

## Club
- createClub  
- listClubs  
- updateClub  
- deleteClub  
- addClubMembers  
- updateClubMemberPosition  
- removeClubMember  

---

## PrefectPosition
- createPrefectPosition  
- listPrefectPositions  
- updatePrefectPosition  
- deletePrefectPosition  

---

## Prefect
- createPrefectYear  
- addPrefectStudent  
- updatePrefectStudent  
- removePrefectStudent  
- listPrefects  

---

## Event
- createEvent  
- listEvents  
- updateEvent  
- deleteEvent  

---

## EventRegistration
- registerEventStudent  
- removeEventRegistration  
- listEventRegistrations  

---

## Parent
- createParent  
- listParents  
- updateParent  
- deleteParent  

---

## ParentStudentLink
- linkParentStudent  
- updateParentStudentLink  
- unlinkParentStudent  

---

## AppUser
- createUser  
- listUsers  
- updateUserRole  
- disableUser  

---

## ReportService
- reportStudent  
- reportGrade  
- reportTeacher  
- reportHouse  
- reportTeams  

---

# 2. Requirement-wise Mapping (F1 → F42)

| Requirement | Function(s) |
|------------|-------------|
| **F1** | Section CRUD |
| **F2** | Grade CRUD |
| **F3** | promoteStudentsByDOB + grade/section update |
| **F4** | Student CRUD |
| **F5** | addStudentNote/removeStudentNote |
| **F6** | StudentTalent CRUD |
| **F7** | getStudent360 |
| **F8** | markAttendanceBatch |
| **F9** | unique index |
| **F10** | computeAttendanceRisk |
| **F11** | House CRUD |
| **F12** | assignStudentHouse |
| **F13** | assignTeacherHouse |
| **F14** | computeHousePoints + reportHouse |
| **F15** | Squad CRUD |
| **F16** | Competition CRUD |
| **F17** | HouseRule upsert/get |
| **F18** | CompetitionRegistration CRUD |
| **F19** | CompetitionTeam CRUD |
| **F20** | recordResults |
| **F21** | getZonalSuggestions |
| **F22** | saveTeamSelection + computeTeamTotalMarks |
| **F23** | autoGenerateNextLevel (zonal→district) |
| **F24** | autoGenerateNextLevel (district→allisland) |
| **F25** | StaffRole CRUD |
| **F26** | Teacher CRUD |
| **F27** | Club MIC via updateClub + role assignment |
| **F28** | ClubPosition CRUD |
| **F29** | Club CRUD |
| **F30** | club membership ops |
| **F31** | PrefectPosition CRUD |
| **F32** | Prefect CRUD |
| **F33** | student360 prefect section |
| **F34** | Event CRUD |
| **F35** | EventRegistration CRUD |
| **F36** | Parent CRUD |
| **F37** | ParentStudentLink CRUD |
| **F38** | reportStudent |
| **F39** | reportGrade |
| **F40** | reportTeacher |
| **F41** | reportHouse |
| **F42** | reportTeams |

---

# End of document
