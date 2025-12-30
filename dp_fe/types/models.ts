/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Frontend Model Types (aligned to final backend schemas + FR F1–F42)
 * Source: final schemas in School System FR + Models doc.
 *
 * Rule:
 * - Do NOT add new fields that are not in final backend schemas.
 * - If a field isn't fully visible in the uploaded snippet, keep it optional.
 */

export type Id = string;

/* -------------------- API SHAPES -------------------- */
export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, any>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/* -------------------- BASE / COMMON -------------------- */
export type BaseDoc = {
  id: Id;
  schoolId: Id;
  createdAt?: string;
  updatedAt?: string;
};

/* -------------------- SECTION (F1) -------------------- */
export type Section = BaseDoc & {
  nameSi: string;
  nameEn: string;
  assignedGradeIds: Id[];
};

/* -------------------- GRADE (F2) -------------------- */
export type PastTeacher = {
  teacherId: Id;
  fromYear: number;
  toYear?: number;
};

export type Grade = BaseDoc & {
  nameSi: string;
  nameEn: string;
  level: number; // 1–14
  classTeacherId?: Id | null;
  pastTeachers: PastTeacher[];
};

/* -------------------- STUDENT (F4–F7) -------------------- */
export type EmergencyContact = {
  nameSi?: string;
  nameEn?: string;
  relationshipSi?: string;
  relationshipEn?: string;
  number?: string;
};

export type StudentNoteCategory =
  | "academic"
  | "behaviour"
  | "achievement"
  | "health"
  | "other";

export type StudentNote = {
  createdById: Id;
  category: StudentNoteCategory;
  content: string;
  notedAt?: string;
};

export type Student = BaseDoc & {
  // --- Names ---
  firstNameSi: string;
  lastNameSi: string;
  fullNameSi: string;
  nameWithInitialsSi: string;

  firstNameEn?: string;
  lastNameEn?: string;
  fullNameEn: string;

  // --- Personal ---
  admissionNumber: string;
  admissionDate: string;
  dob: string;
  sex: "male" | "female";
  birthCertificateNumber?: string;

  // --- Academic ---
  gradeId: Id;
  sectionId?: Id;
  admittedGrade?: string;
  medium?: "sinhala" | "english" | "tamil";
  academicYear: number;

  // --- Contact ---
  email?: string;
  phoneNum?: string;
  whatsappNumber?: string;
  emergencyNumber?: string;
  addressSi?: string;
  addressEn?: string;

  // --- Parents ---
  motherNameEn?: string;
  motherNumber?: string;
  motherOccupation?: string;
  fatherNameEn?: string;
  fatherNumber?: string;
  fatherOccupation?: string;

  // --- Legacy / Extra ---
  emergencyContacts: EmergencyContact[];
  notes: StudentNote[];
};

/* -------------------- STUDENT TALENT (F6) -------------------- */
export type TalentLevel =
  | "school"
  | "zonal"
  | "district"
  | "provincial"
  | "national"
  | "international";

export type StudentTalent = BaseDoc & {
  studentId: Id;

  areaSi?: string;
  areaEn: string;

  level?: TalentLevel;
  notes?: string;
  starLevel?: 1 | 2;

  year?: number;
};

/* -------------------- ATTENDANCE (F8–F10) -------------------- */
/**
 * Attendance schema snippet wasn't fully visible in the extract you uploaded.
 * These are the safe fields implied by FR + naming in plan:
 * - one record per student per Sunday
 * - grade-wise bulk marking
 */
export type AttendanceRiskStage =
  | "critical"
  | "medium"
  | "normal"
  | "good"
  | "better";

export type Attendance = BaseDoc & {
  studentId: Id;
  gradeId: Id;
  date: string; // Sunday date (ISO)
  isPresent: boolean;
  year: number;
  riskStage?: AttendanceRiskStage; // derived by backend
};

/* -------------------- HOUSE (F11) -------------------- */
export type House = BaseDoc & {
  nameSi: string;
  nameEn: string;
  color: string;
  mottoSi?: string;
  mottoEn?: string;
};

/* -------------------- STUDENT HOUSE ASSIGNMENT (F12) -------------------- */
export type StudentHouseAssignment = BaseDoc & {
  studentId: Id;
  gradeId: Id;
  houseId: Id;
  year: number;
  assignedDate?: string;
};

/* -------------------- TEACHER HOUSE ASSIGNMENT (F13) -------------------- */
export type TeacherHouseAssignment = BaseDoc & {
  teacherId: Id;
  houseId: Id;
  year: number;
  assignedDate?: string;
};

/* -------------------- SQUAD / SOCIETY (F15) -------------------- */
export type Squad = BaseDoc & {
  nameSi: string;
  nameEn: string;
  icon?: string;
  assignedGradeIds?: Id[];
  assignedSectionIds?: Id[];
};

/* -------------------- COMPETITION (F16) -------------------- */
export type CompetitionScope = "open" | "grade" | "section";

export type Competition = BaseDoc & {
  nameSi: string;
  nameEn: string;

  squadId?: Id;

  scope: CompetitionScope;
  gradeIds?: Id[];
  sectionIds?: Id[];

  isMainCompetition: boolean;
  active: boolean;
  year?: number;

  participationType?: "individual" | "team";
  teamConfig?: {
    minSize: number;
    maxSize: number;
  };
  personalAwards?: string[];
  pointsConfig?: {
    place1: number;
    place2: number;
    place3: number;
    place4: number;
    place5: number;
  };
};

/* -------------------- COMPETITION HOUSE RULE (F17) -------------------- */
export type CompetitionHouseRule = BaseDoc & {
  competitionId: Id;
  year: number;

  maxPerHousePerGrade: number; // default 2
  maxTotalPerGrade: number; // default 8
  noteSi?: string;
  noteEn?: string;
};

/* -------------------- COMPETITION REGISTRATION (F18) -------------------- */
export type CompetitionRegistration = BaseDoc & {
  competitionId: Id;

  studentId: Id | { id: Id; firstNameEn: string; lastNameEn: string; admissionNumber: string; nameWithInitialsSi?: string };
  gradeId: Id;
  houseId?: Id | null;

  year: number;
  registeredDate: string;
  registeredById?: Id;
  mode?: "house" | "independent"; // used in services
};

/* -------------------- COMPETITION TEAM (F19) -------------------- */
export type CompetitionTeamType = "house" | "independent";

export type CompetitionTeam = BaseDoc & {
  competitionId: Id;
  year: number;

  type: CompetitionTeamType;
  houseId?: Id;
  gradeId?: Id;

  teamNameSi?: string;
  teamNameEn?: string;

  memberStudentIds: Id[];

  registeredById?: Id;
};

/* -------------------- COMPETITION RESULT (F20) -------------------- */
/**
 * Results schema not fully visible in snippet.
 * Safe shape: per competition+year, store places 1–5; winner can be student or team.
 */
export type CompetitionPlace = 0 | 1 | 2 | 3 | 4 | 5;

export type CompetitionResultEntry = {
  place: CompetitionPlace;
  studentId?: Id;
  teamId?: Id;
  houseId?: Id;
  gradeId?: Id;
};

export type CompetitionResult = BaseDoc & {
  competitionId: Id;
  year: number;
  place: CompetitionPlace;
  studentId?: Id;
  teamId?: Id;
  houseId?: Id;
  gradeId?: Id;
  recordedById?: Id;
  recordedDate?: string;
};

/* -------------------- TEAM SELECTION (F21–F24) -------------------- */
/**
 * Pipeline models not fully visible.
 * Safe fields per FR:
 * - level (zonal/district/all-island)
 * - derived from main competition 1st places
 * - totalMarks and position stored
 */
export type TeamLevel = "zonal" | "district" | "allisland";

export type TeamSelectionEntry = {
  competitionId: Id;
  studentId: Id;
  place?: number;
};

export type TeamSelection = BaseDoc & {
  level: TeamLevel;
  year: number;
  entries: TeamSelectionEntry[];
  totalMarks?: number;
  teamPosition?: CompetitionPlace;
  updatedById?: Id;
};

/* -------------------- STAFF ROLE (F25) -------------------- */
export type StaffRoleScope =
  | "grade-single"
  | "grade-multiple"
  | "all-grades"
  | "society-head"
  | "club-head";

export type StaffRole = BaseDoc & {
  nameSi: string;
  nameEn: string;
  gradeBased?: boolean;
  singleGraded?: boolean;
  gradesEffected?: Id[];
  responsibilities?: { level: 1 | 2; textSi: string; textEn: string }[];
  descriptionSi?: string;
  descriptionEn?: string;
  teacherIds?: Id[];
  order?: number;
};

/* -------------------- TEACHER (F26–F27) -------------------- */
export type TeacherStatus = "active" | "inactive";

export type TeacherPastRole = {
  roleId: Id;
  fromYear: number;
  toYear?: number;
};

export type Teacher = BaseDoc & {
  firstNameSi?: string;
  lastNameSi?: string;
  fullNameSi?: string;

  firstNameEn: string;
  lastNameEn: string;
  fullNameEn?: string;

  email?: string;
  phone?: string;
  dateJoined?: string;
  dob?: string;
  qualifications?: string[];

  roleIds?: Id[];
  pastRoles?: TeacherPastRole[];

  status?: TeacherStatus;
};

/* -------------------- CLUB POSITION (F28) -------------------- */
export type ClubPosition = BaseDoc & {
  nameSi: string;
  nameEn: string;
  descriptionSi?: string;
  descriptionEn?: string;
  clubId?: Id | null; // global or club-specific
};

/* -------------------- CLUB (F29–F30) -------------------- */
export type ClubMember = {
  studentId: Id;
  positionId?: Id | null;
};

export type Club = BaseDoc & {
  nameSi: string;
  nameEn: string;
  descriptionSi?: string;
  descriptionEn?: string;
  teacherInChargeId: Id;
  year: number;
  members?: ClubMember[];
};

/* -------------------- PREFECT POSITION (F31) -------------------- */
export type PrefectPosition = BaseDoc & {
  nameSi: string;
  nameEn: string;
  responsibilitySi?: string;
  responsibilityEn?: string;
  descriptionSi?: string;
  descriptionEn?: string;
  rankLevel?: number;
};

/* -------------------- PREFECT YEAR (F32–F33) -------------------- */
export type PrefectRank = "prefect" | "vice-prefect" | "head-prefect";

export type PrefectStudent = {
  studentId: Id;
  studentNameSi?: string;
  studentNameEn?: string;
  rank: PrefectRank;
  positionIds?: Id[];
};

export type Prefect = BaseDoc & {
  year: number;
  appointedDate: string;
  students: PrefectStudent[];
};

/* -------------------- EVENT (F34) -------------------- */
export type EventCategory =
  | "club"
  | "squad"
  | "staff"
  | "academic"
  | "regular"
  | "main";

export type Event = BaseDoc & {
  titleSi: string;
  titleEn: string;
  descriptionSi?: string;
  descriptionEn?: string;

  category: EventCategory;

  clubId?: Id;
  squadId?: Id;
  chairHeadTeacherId?: Id;

  startDate: string;
  endDate?: string;
  year: number;

  isRegistrable: boolean;
};

/* -------------------- EVENT REGISTRATION (F35) -------------------- */
export type EventRegistration = BaseDoc & {
  eventId: Id;

  studentId: Id;
  gradeId: Id;

  starLevel?: 1 | 2 | 3;
  noteSi?: string;
  noteEn?: string;

  year: number;
  registeredById?: Id;
};

/* -------------------- GRADING SCHEMA (F? master data) -------------------- */
export type GradeBand = {
  label: string; // e.g., A, B, C
  min: number;
  max: number;
};

export type GradingSchema = BaseDoc & {
  nameSi: string;
  nameEn: string;
  bands: GradeBand[];
  year?: number;
};

/* -------------------- EXAM RESULT (F8 exams) -------------------- */
export type ExamTerm = 1 | 2 | 3;

export type ExamResultEntry = {
  studentId: Id;
  marks: number;
  gradeBand?: string;
};

export type ExamResult = BaseDoc & {
  gradeId: Id;
  term: ExamTerm;
  year: number;
  gradingSchemaId: Id;
  results: ExamResultEntry[];
};

/* -------------------- PARENT (F36) -------------------- */
export type Parent = BaseDoc & {
  firstNameSi?: string;
  lastNameSi?: string;
  fullNameSi?: string;

  firstNameEn: string;
  lastNameEn: string;
  fullNameEn?: string;

  occupationSi?: string;
  occupationEn?: string;

  phoneNum?: string;
  email?: string;
  addressSi?: string;
  addressEn?: string;
};

/* -------------------- PARENT-STUDENT LINK (F37) -------------------- */
export type RelationshipType =
  | "mother"
  | "father"
  | "guardian"
  | "other";

export type ParentStudentLink = BaseDoc & {
  parentId: Id;
  studentId: Id;
  relationshipSi?: string;
  relationshipEn?: string;
  isPrimary?: boolean;
};

/* -------------------- APP USER (RBAC) -------------------- */
/**
 * AppUser schema not visible in snippet; safe RBAC+auth fields.
 */
export type UserRole =
  | "superadmin"
  | "admin"
  | "principal"
  | "teacher"
  | "moderator"
  | "viewer";

export type AppUser = BaseDoc & {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  roleIds: Id[];
  teacherId?: Id;
  isActive: boolean;
  permissions?: string[];
};

export type Role = BaseDoc & {
  name: string;
  description?: string;
  permissions: string[];
  singleGraded: boolean;
};

/* -------------------- REPORT OUTPUTS (F38–F42) -------------------- */
export type StudentReport = {
  student: Student;
  attendancePercent?: number;
  riskStage?: AttendanceRiskStage;
  examTrend?: any;
  awards?: any[];
  roles?: any[];
};

export type GradeReport = {
  grade: Grade;
  studentCount: number;
  attendanceSummary?: any;
  termPerformance?: any;
  houseContributions?: any;
};

export type TeacherReport = {
  teacher: Teacher;
  rolesByYear?: any[];
  micClubs?: Club[];
  houseAssignments?: TeacherHouseAssignment[];
};

export type HouseReport = {
  house: House;
  year: number;
  pointsByCompetition?: any[];
  totalPoints?: number;
  position?: number;
};

export type TeamReport = {
  level: TeamLevel;
  year: number;
  teams: TeamSelection[];
};
