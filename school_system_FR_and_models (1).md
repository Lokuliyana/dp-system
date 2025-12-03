# School Administration System — Functional Requirements & Backend Model Specification (Sinhala Dhamma School)

This document consolidates the complete system expectations, functional requirements, finalized backend models (with Sinhala + English labels), module-wise clarifications, and final implementation summary.

---

## 1. Functions (Complete System Expectations)

### 1.1 Academic Structure
**F1. Manage Sections (CRUD).**  
Create, read, update, delete sections with Sinhala and English names.

**F2. Manage Grades (CRUD).**  
Create grades 1–14, assign to a section, manage class teacher (one per grade), and keep past teacher history.

**F3. Auto-promote students yearly.**  
At year change, promote students based on DOB rules:
- update gradeId
- update academicYear
- re-derive sectionId from grade→section mapping  
No manual promotion.

---

### 1.2 Students
**F4. Manage Students (CRUD).**  
Create students with Sinhala+English names, admission info, grade, contact, emergency contacts.

**F5. Student Notes.**  
Add/remove notes inside student profile (category + content + who added).

**F6. Student Talents (manual).**  
Record talents manually per student: area, level, notes, starLevel.

**F7. Student profile view (year-wise aggregation).**  
For any student, show:
- basic info
- attendance across all Sundays
- exam results across years/terms
- house history
- competitions participated & won
- team selections (zonal/district/all island)
- club memberships & roles
- prefect history
- optional event participation  
All filterable by year and section.

---

### 1.3 Attendance (Sunday-only)
**F8. Weekly class attendance marking.**  
Every Sunday, mark present/absent for all students in a grade.

**F9. Prevent duplicates.**  
One record per student per Sunday.

**F10. Attendance risk classification.**  
Compute attendance % and mark students as critical/medium/normal/good/better.

---

### 1.4 Houses & House Meet
**F11. Manage Houses (CRUD).**  
Create 4 houses with Sinhala/English names, color, motto.

**F12. Yearly student house assignment.**  
Assign students to houses per year, grade-wise. Reassignment overwrites same year.

**F13. Yearly teacher house assignment.**  
Assign teachers to houses per year.

**F14. Annual house leaderboard.**  
Compute house points based on competition results:
- 1st=15, 2nd=10, 3rd=5 only  
Identify winning house yearly.

---

### 1.5 Societies (Squads) → Competitions
**F15. Manage Societies as Squads (CRUD).**  
Create squads like Daham Danuma, Oratory, Art, etc. with eligibility by grade/section.

**F16. Manage Competitions under Squads (CRUD).**  
Create competitions for a year under a squad. Set scope:
- open
- grade-based
- section-based  
Link main competitions (41) vs others.

**F17. Define house quota rules per competition/year.**  
Default:
- 2 students per house per grade  
Special overrides allowed (e.g., Primary Art houses-only cap).

**F18. Register participants (house + independent).**  
House registrations enforce quota.  
Independent registrations unlimited.

**F19. Team competitions.**  
Support team entries:
- store actual team members per competition/year/house or independent.
- teams can win places.

**F20. Record results per competition/year.**  
Store places 1–5:
- single → student winner
- team → team winner (linked to stored members)  
Used for house points + history.

---

### 1.6 Zonal / District / All-Island Pipeline
**F21. Zonal team manual selection from 41 main competitions.**  
System suggests 1st place from each main competition, but admin can override.  
One student max 3 competitions considered.

**F22. Record zonal results and total marks.**  
Team marks:
- 1st=5, 2nd=4, 3rd=3, 4th=2, 5th=1.  
Store totalMarks and teamPosition.

**F23. Auto-create District team from zonal 1st places.**  
Same storage and scoring.

**F24. Auto-create All-Island team from district 1st places.**  
Same storage and scoring.

---

### 1.7 Staff Roles & Teachers
**F25. Manage Staff Roles (CRUD).**  
Roles with hierarchy/scope and responsibilities:
- grade-based single (class teacher)
- grade-based multiple
- all-grades roles
- society/club heads  
Each role supports multiple teachers and internal rank order.

**F26. Manage Teachers (CRUD).**  
Teachers have Sinhala+English names, email, phone, qualifications, roles, past roles, status.

**F27. Assign teachers as MICs and squad leaders.**  
Clubs can have multiple MIC teachers. Societies use staff roles or direct linking.

---

### 1.8 Clubs & Student Positions
**F28. Manage Club Positions (CRUD).**  
Create positions (global or club-specific).

**F29. Manage Clubs (CRUD).**  
Create clubs with Sinhala+English names, description, founded date, MIC list.

**F30. Manage club memberships.**  
Add/remove students, assign position, join/left dates, star level.

---

### 1.9 Prefects
**F31. Manage Prefect Positions (CRUD).**  
Positions with Sinhala+English names, responsibility, description, rankLevel.

**F32. Appoint prefects yearly.**  
Pick students, assign rank (prefect/vice/head), assign multiple positions.

**F33. Prefect history view.**  
Show yearly prefect roles per student (with ranks).

---

### 1.10 Events (Optional student registration)
**F34. Manage Events (CRUD).**  
Create events under club/squad/staff/academic/regular.

**F35. Optional event registration.**  
If event is registrable, add students with:
- starLevel 1/2/3
- short note/remark  
If not registrable, no participation list.

---

### 1.11 Parents & Links
**F36. Manage Parents (CRUD).**  
Parents with Sinhala+English names, occupation, contacts.

**F37. Link parents to students.**  
Store relationship type + primary contact flag. Multiple students per parent.

---

### 1.12 Reporting
**F38. Student reports.**  
Year-wise attendance %, risk status, exam performance trend, awards, roles.

**F39. Grade reports.**  
Student counts, attendance trend, term performance, house contributions.

**F40. Teacher reports.**  
Roles held, years served, MIC/squad leadership, house assignment.

**F41. House meet reports.**  
Competition points breakdown and yearly winning house.

**F42. Team performance reports.**  
Zonal/district/all-island totals and final positions.

---

## 2. Backend Models (Final Mongoose Schemas)

All models include Sinhala + English readable labels (e.g., nameSi/nameEn), use Mongo `_id`, and `{ timestamps: true }`.

### 2.0 Base Schema Options
```js
/* eslint-disable no-underscore-dangle */
const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
};
module.exports = { baseSchemaOptions };
```

### 2.1 Section
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const sectionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    assignedGradeIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Grade", index: true },
    ],

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

sectionSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("Section", sectionSchema);
```

### 2.2 Grade
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const pastTeacherSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    fromYear: { type: Number, required: true },
    toYear: { type: Number },
  },
  { _id: false }
);

const gradeSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 1, max: 14 },

    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    pastTeachers: { type: [pastTeacherSchema], default: [] },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

gradeSchema.index({ schoolId: 1, level: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("Grade", gradeSchema);
```

### 2.3 Student (with embedded Notes)
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const emergencyContactSchema = new mongoose.Schema(
  {
    nameSi: { type: String, trim: true },
    nameEn: { type: String, trim: true },
    relationshipSi: { type: String, trim: true },
    relationshipEn: { type: String, trim: true },
    number: { type: String, trim: true },
  },
  { _id: false }
);

const studentNoteSchema = new mongoose.Schema(
  {
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser", required: true },
    category: {
      type: String,
      enum: ["academic", "behaviour", "achievement", "health", "other"],
      default: "other",
    },
    content: { type: String, required: true, trim: true },
    notedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    firstNameSi: { type: String, trim: true },
    lastNameSi: { type: String, trim: true },
    fullNameSi: { type: String, trim: true },

    firstNameEn: { type: String, required: true, trim: true },
    lastNameEn: { type: String, required: true, trim: true },
    fullNameEn: { type: String, trim: true },

    admissionNumber: { type: String, required: true, trim: true },
    admissionDate: { type: Date, required: true },
    dob: { type: Date, required: true },

    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", index: true },

    email: { type: String, trim: true, lowercase: true },
    phoneNum: { type: String, trim: true },
    addressSi: { type: String, trim: true },
    addressEn: { type: String, trim: true },

    emergencyContacts: { type: [emergencyContactSchema], default: [] },
    notes: { type: [studentNoteSchema], default: [] },

    academicYear: { type: Number, required: true, index: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });

studentSchema.pre("save", function setFullNames(next) {
  this.fullNameEn = `${this.firstNameEn} ${this.lastNameEn}`.trim();
  if (this.firstNameSi || this.lastNameSi) {
    this.fullNameSi = `${this.firstNameSi || ""} ${this.lastNameSi || ""}`.trim();
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
```

### 2.4 StudentTalent
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const talentLevels = [
  "school",
  "zonal",
  "district",
  "provincial",
  "national",
  "international",
];

const studentTalentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },

    areaSi: { type: String, trim: true },
    areaEn: { type: String, required: true, trim: true },

    level: { type: String, enum: talentLevels },
    notes: { type: String, trim: true },
    starLevel: { type: Number, enum: [1, 2] },

    year: { type: Number, index: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

studentTalentSchema.index({ schoolId: 1, studentId: 1, areaEn: 1, year: 1 });

module.exports = mongoose.model("StudentTalent", studentTalentSchema);
```

### 2.5 Attendance
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    recordedById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },

    academicYear: { type: Number, required: true, index: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

attendanceSchema.index({ schoolId: 1, studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
```

### 2.6 House
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const houseSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    color: { type: String, required: true, trim: true },
    mottoSi: { type: String, trim: true },
    mottoEn: { type: String, trim: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

houseSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("House", houseSchema);
```

### 2.7 StudentHouseAssignment
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const studentHouseAssignmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    year: { type: Number, required: true, index: true },
    assignedDate: { type: Date, required: true },
    assignedById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

studentHouseAssignmentSchema.index({ schoolId: 1, studentId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("StudentHouseAssignment", studentHouseAssignmentSchema);
```

### 2.8 TeacherHouseAssignment
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const teacherHouseAssignmentSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    year: { type: Number, required: true, index: true },
    assignedDate: { type: Date, required: true },
    assignedById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

teacherHouseAssignmentSchema.index({ schoolId: 1, teacherId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("TeacherHouseAssignment", teacherHouseAssignmentSchema);
```

### 2.9 Squad (Society)
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const squadSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    scope: { type: String, enum: ["grade", "section", "all"], default: "all" },
    gradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
    sectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

squadSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("Squad", squadSchema);
```

### 2.10 Competition
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const competitionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    squadId: { type: mongoose.Schema.Types.ObjectId, ref: "Squad", required: true, index: true },

    scope: { type: String, enum: ["open", "grade", "section"], required: true },
    gradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
    sectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    isMainCompetition: { type: Boolean, default: false },
    year: { type: Number, required: true, index: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

competitionSchema.index({ schoolId: 1, squadId: 1, year: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("Competition", competitionSchema);
```

### 2.11 CompetitionHouseRule
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const competitionHouseRuleSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    year: { type: Number, required: true, index: true },

    maxPerHousePerGrade: { type: Number, default: 2 },
    maxTotalPerGrade: { type: Number, default: 8 },
    noteSi: { type: String, trim: true },
    noteEn: { type: String, trim: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

competitionHouseRuleSchema.index({ schoolId: 1, competitionId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("CompetitionHouseRule", competitionHouseRuleSchema);
```

### 2.12 CompetitionRegistration
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const competitionRegistrationSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House" },

    year: { type: Number, required: true, index: true },
    registeredDate: { type: Date, required: true },
    registeredById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

competitionRegistrationSchema.index(
  { schoolId: 1, competitionId: 1, studentId: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("CompetitionRegistration", competitionRegistrationSchema);
```

### 2.13 CompetitionTeam
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const competitionTeamSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    year: { type: Number, required: true, index: true },

    type: { type: String, enum: ["house", "independent"], required: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House" },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade" },

    teamNameSi: { type: String, trim: true },
    teamNameEn: { type: String, trim: true },

    memberStudentIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    ],

    registeredById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

competitionTeamSchema.index(
  { schoolId: 1, competitionId: 1, year: 1, type: 1, houseId: 1 }
);

module.exports = mongoose.model("CompetitionTeam", competitionTeamSchema);
```

### 2.14 CompetitionResult
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const competitionResultSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    year: { type: Number, required: true, index: true },

    place: { type: Number, enum: [1, 2, 3, 4, 5], required: true },

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "CompetitionTeam" },

    houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House" },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

competitionResultSchema.index(
  { schoolId: 1, competitionId: 1, year: 1, place: 1 },
  { unique: true }
);

module.exports = mongoose.model("CompetitionResult", competitionResultSchema);
```

### 2.15 TeamSelection
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const teamEntrySchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    place: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const teamSelectionSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["zonal", "district", "allisland"], required: true, index: true },
    year: { type: Number, required: true, index: true },

    entries: { type: [teamEntrySchema], default: [] },

    totalMarks: { type: Number, default: 0 },
    teamPosition: { type: Number },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

teamSelectionSchema.index({ schoolId: 1, level: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("TeamSelection", teamSelectionSchema);
```

### 2.16 GradingSchema
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const gradingSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    maxMarks: { type: Number, required: true },
    minMarks: { type: Number, required: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

gradingSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("GradingSchema", gradingSchema);
```

### 2.17 ExamResult
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const perStudentResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    mark: { type: Number, required: true },
    gradingSchemaId: { type: mongoose.Schema.Types.ObjectId, ref: "GradingSchema", required: true },
  },
  { _id: false }
);

const examResultSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, index: true },
    term: { type: Number, required: true, min: 1, max: 3 },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true, index: true },

    results: { type: [perStudentResultSchema], default: [] },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

examResultSchema.index({ schoolId: 1, year: 1, term: 1, gradeId: 1 }, { unique: true });

module.exports = mongoose.model("ExamResult", examResultSchema);
```

### 2.18 StaffRole
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const responsibilitySchema = new mongoose.Schema(
  {
    level: { type: Number, enum: [1, 2], required: true },
    textSi: { type: String, required: true, trim: true },
    textEn: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const staffRoleSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    gradeBased: { type: Boolean, default: false },
    singleGraded: { type: Boolean, default: false },
    gradesEffected: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],

    responsibilities: { type: [responsibilitySchema], default: [] },

    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

staffRoleSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("StaffRole", staffRoleSchema);
```

### 2.19 Teacher
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const pastRoleSchema = new mongoose.Schema(
  {
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "StaffRole", required: true },
    fromYear: { type: Number, required: true },
    toYear: { type: Number },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    firstNameSi: { type: String, trim: true },
    lastNameSi: { type: String, trim: true },
    fullNameSi: { type: String, trim: true },

    firstNameEn: { type: String, required: true, trim: true },
    lastNameEn: { type: String, required: true, trim: true },
    fullNameEn: { type: String, trim: true },

    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    dob: { type: Date },
    dateJoined: { type: Date, required: true },

    roleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "StaffRole" }],
    pastRoles: { type: [pastRoleSchema], default: [] },

    qualifications: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

teacherSchema.pre("save", function setFullNames(next) {
  this.fullNameEn = `${this.firstNameEn} ${this.lastNameEn}`.trim();
  if (this.firstNameSi || this.lastNameSi) {
    this.fullNameSi = `${this.firstNameSi || ""} ${this.lastNameSi || ""}`.trim();
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
```

### 2.20 ClubPosition
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const clubPositionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    responsibilitySi: { type: String, trim: true },
    responsibilityEn: { type: String, trim: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

clubPositionSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("ClubPosition", clubPositionSchema);
```

### 2.21 Club
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const clubMembershipSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentNameSi: { type: String, trim: true },
    studentNameEn: { type: String, trim: true },

    positionId: { type: mongoose.Schema.Types.ObjectId, ref: "ClubPosition" },
    dateJoined: { type: Date, required: true },
    leftDate: { type: Date },
    starLevel: { type: Number, enum: [1, 2] },
  },
  { _id: false }
);

const clubSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    descriptionsSi: { type: String, trim: true },
    descriptionsEn: { type: String, trim: true },

    foundedMonth: { type: Number, min: 1, max: 12 },
    foundedYear: { type: Number, min: 1800 },

    micTeacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true }],

    memberships: { type: [clubMembershipSchema], default: [] },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

clubSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("Club", clubSchema);
```

### 2.22 PrefectPosition
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const prefectPositionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    responsibilitySi: { type: String, trim: true },
    responsibilityEn: { type: String, trim: true },
    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    rankLevel: { type: Number },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

prefectPositionSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true });

module.exports = mongoose.model("PrefectPosition", prefectPositionSchema);
```

### 2.23 Prefect
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const ranks = ["prefect", "vice-prefect", "head-prefect"];

const prefectStudentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentNameSi: { type: String, trim: true },
    studentNameEn: { type: String, trim: true },

    rank: { type: String, enum: ranks, required: true },

    positionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "PrefectPosition" }],
  },
  { _id: false }
);

const prefectSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, index: true },
    appointedDate: { type: Date, required: true },

    students: { type: [prefectStudentSchema], default: [] },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

prefectSchema.index({ schoolId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Prefect", prefectSchema);
```

### 2.24 Event
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const eventSchema = new mongoose.Schema(
  {
    titleSi: { type: String, required: true, trim: true },
    titleEn: { type: String, required: true, trim: true },
    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    category: { type: String, enum: ["club", "squad", "staff", "academic", "regular"], required: true },

    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
    squadId: { type: mongoose.Schema.Types.ObjectId, ref: "Squad" },

    startDate: { type: Date, required: true },
    endDate: { type: Date },
    year: { type: Number, required: true, index: true },

    isRegistrable: { type: Boolean, default: false },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

eventSchema.index({ schoolId: 1, year: 1, titleEn: 1 });

module.exports = mongoose.model("Event", eventSchema);
```

### 2.25 EventRegistration
```js
const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./_base");

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },

    starLevel: { type: Number, enum: [1, 2, 3] },
    noteSi: { type: String, trim: true },
    noteEn: { type: String, trim: true },

    year: { type: Number, required: true, index: true },
    registeredById: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", index: true },
  },
  baseSchemaOptions
);

eventRegistrationSchema.index(
  { schoolId: 1, eventId: 1, studentId: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
```

### 2.26 Parent & 2.27 ParentStudentLink & 2.28 AppUser
(Identical to previous consolidated answer; included in full in the main chat.)

---

## 3. Module-wise Clarification (How it Works)

1. **Sections ↔ Grades ↔ Students**  
   - Sections hold grades.  
   - Grades hold level and class teacher.  
   - Students belong to grades; section derived.  
   - Promotion updates grade and derives section yearly.

2. **Houses**  
   - House master static.  
   - Student & teacher house assignments per year.  
   - House leaderboard is computed annually.

3. **Societies (Squads)**  
   - Squads represent societies and eligibility.  
   - Competitions are created under squads per year.

4. **Competitions**  
   - House quota rules stored per competition per year.  
   - Registrations allow house and independent entries.  
   - Results store places 1–5.

5. **Team Competitions**  
   - Teams are stored in **CompetitionTeam** with real members.  
   - Results reference teamId when team-based.

6. **Higher Teams**  
   - Zonal selection manual from 41 main competitions.  
   - District & allisland auto-generated from prior 1st places.  
   - Stored in TeamSelection.

7. **Attendance**  
   - Sunday-only, grade-wise bulk marking.  
   - duplicates prevented.  
   - risk stage derived.

8. **Exams**  
   - 3 terms per year per grade.  
   - results stored in ExamResult with GradingSchema.

9. **Staff Roles & Teachers**  
   - Roles define hierarchy/scope/responsibilities.  
   - Teachers can hold multiple roles.  
   - Role teacher order implies internal rank.

10. **Clubs & Prefects & Events & Parents**  
   - Membership/appointments stored yearly or embedded as designed.  
   - Optional EventRegistration only if event.isRegistrable = true.  
   - Parent links stored in ParentStudentLink.

---

## 4. Final Summary: Student 360° View + Reports + Complete Plan

### Student-Centered 360° View
Selecting a student must show year-wise:
- Basic info  
- Attendance (all Sundays)  
- Exam results (3 terms/year)  
- House history  
- Competition registrations  
- Competition wins  
- Team participation via CompetitionTeam  
- Zonal/District/All-island entries & wins  
- Club memberships & roles  
- Prefect history  
- Optional event participation  
- Notes and talents  

All retrieved by aggregation; no duplicated storage.

### Reports
Derived dashboards and exports:
- **Per student**: attendance %, risk stage, result trend, awards, roles.  
- **Per grade**: attendance and results distribution, top students, house contributions.  
- **Per teacher**: roles held by year, MIC/squad leadership, house assignments.  
- **Per house**: points per competition, total yearly winner.  
- **Per team level**: zonal/district/all-island totals and positions.  

### Complete Implementation Plan
1. Master CRUD: Section, Grade, House, Squad, StaffRole, PrefectPosition, ClubPosition, GradingSchema.  
2. Core CRUD: Student, Teacher, Parent, Club, Competition, Event.  
3. Annual processes: promotion job, house yearly assignment, Sunday attendance batches.  
4. Competitions: quota rules, registrations, team entries, results, house scoring.  
5. Higher pipeline: zonal selection + suggestions, district/all-island auto-creation.  
6. Student 360° aggregation endpoints.  
7. Reporting endpoints and admin dashboards.

---

End of document.
