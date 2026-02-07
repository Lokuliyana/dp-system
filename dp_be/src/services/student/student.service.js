const Student = require('../../models/student/student.model')
const Grade = require('../../models/system/grade.model')
const ApiError = require('../../utils/apiError')
const xlsx = require('xlsx')

// other models for 360 view (some may be added later)
const Attendance = require('../../models/student/attendance.model')
const ExamResult = require('../../models/student/examResult.model')
const StudentHouseAssignment = require('../../models/housemeets/studentHouseAssignment.model')
const CompetitionRegistration = require('../../models/housemeets/competitionRegistration.model')
const CompetitionResult = require('../../models/housemeets/competitionResult.model')
const CompetitionTeam = require('../../models/housemeets/competitionTeam.model')
const TeamSelection = require('../../models/housemeets/teamSelection.model')
const Club = require('../../models/activities/club.model')
const Prefect = require('../../models/staff/prefect.model')
const EventRegistration = require('../../models/activities/eventRegistration.model')
const StudentTalent = require('../../models/student/studentTalent.model')

function handleDup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Admission number already exists in this school')
  }
  throw err
}

// Helper to calculate grade based on DOB
const calculateGrade = async (schoolId, dob, academicYear) => {
  if (!dob || !academicYear) return null

  const d = new Date(dob)
  const dobYear = d.getFullYear()
  const dobMonth = d.getMonth() + 1 // 1-12

  // Cutoff is Jan 31st.
  // If born Feb-Dec: Grade 1 Year = dobYear + 6
  // If born Jan: Grade 1 Year = dobYear + 5
  let grade1Year
  if (dobMonth > 1) {
    grade1Year = dobYear + 6
  } else {
    // If born in Jan, check day? User said "before 31 goes for senior batch".
    // "2006 jan 31st grade 1 will be 2011". 2006 + 5 = 2011.
    // So if born in Jan (any day <= 31), it's +5.
    grade1Year = dobYear + 5
  }

  const currentLevel = academicYear - grade1Year + 1

  if (currentLevel < 1 || currentLevel > 14) {
    // Out of range, maybe return null or handle gracefully?
    // For now, let's try to find it.
  }

  const grade = await Grade.findOne({ schoolId, level: currentLevel })
  return grade
}

/**
 * Adjusts the query to find students based on their cohort.
 * If gradeId=Grade1 and academicYear=2025, and it's now 2026,
 * it will find students who are currently in Grade 2 (2026).
 */
const applyCohortFilter = async (q, schoolId, gradeId, academicYear, restrictedGradeIds) => {
  const mongoose = require('mongoose')
  
  if (gradeId && academicYear && mongoose.Types.ObjectId.isValid(gradeId)) {
    const grades = await Grade.find({ schoolId }).lean()
    const targetGrade = grades.find((g) => String(g._id) === String(gradeId))
    
    if (targetGrade) {
      const cohortConstant = targetGrade.level - Number(academicYear)
      const years = await Student.distinct('academicYear', { schoolId })
      const matchingPairs = []
      
      for (const y of years) {
        if (y === null || y === undefined) continue
        const neededLevel = cohortConstant + y
        // Find the grade for this level in this specific year
        const g = grades.find((grade) => grade.level === neededLevel && grade.academicYear === String(y)) 
          || grades.find((grade) => grade.level === neededLevel && grade.academicYear === '')
        
        if (g) {
          if (restrictedGradeIds) {
            if (restrictedGradeIds.includes(g._id.toString())) {
              matchingPairs.push({ gradeId: g._id, academicYear: y })
            }
          } else {
            matchingPairs.push({ gradeId: g._id, academicYear: y })
          }
        }
      }
      
      if (matchingPairs.length > 0) {
        q.$or = matchingPairs
        return true
      } else {
        q._id = new mongoose.Types.ObjectId() // Force no results
        return true
      }
    }
  }
  
  // Fallback to original logic
  if (restrictedGradeIds) {
    const allowedIds = restrictedGradeIds.map((id) => new mongoose.Types.ObjectId(id))
    if (gradeId) {
      q.gradeId = restrictedGradeIds.includes(gradeId.toString()) ? gradeId : { $in: [] }
    } else {
      q.gradeId = { $in: allowedIds }
    }
  } else if (gradeId) {
    q.gradeId = gradeId
  }
  
  if (academicYear) q.academicYear = Number(academicYear)
  return false
}

exports.createStudent = async ({ schoolId, payload, userId }) => {
  try {
    // Auto-allocate grade if not provided
    if (!payload.gradeId && payload.dob && payload.academicYear) {
      const grade = await calculateGrade(schoolId, payload.dob, payload.academicYear)
      if (grade) {
        payload.gradeId = grade._id
      } else {
        throw new ApiError(400, 'Could not determine grade based on DOB')
      }
    }

    const doc = await Student.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.bulkImportStudents = async ({ schoolId, fileBuffer, userId }) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 })

  // Remove header
  const rows = data.slice(1)
  const grades = await Grade.find({ schoolId }).lean()

  // We need academicYear to calculate grade.
  // Assuming current year if not specified? Or maybe we should pass it?
  // For now, let's assume the current year is the academic year for import.
  const currentYear = new Date().getFullYear()

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  }

  const parseDate = (val) => {
    if (!val) return undefined
    if (val instanceof Date) return val
    
    // Handle excel serial numbers
    if (typeof val === 'number') {
      return new Date(Math.round((val - 25569) * 86400 * 1000))
    }
    
    if (typeof val === 'string') {
      const s = val.trim()
      if (!s) return undefined

      // Attempt to handle various separators: . / - 
      const parts = s.split(/[.\/\-]/)
      if (parts.length === 3) {
        let day, month, year

        // Detect format: YYYY.? or DD.?
        if (parts[0].length === 4) {
          // Assume YYYY.MM.DD
          year = parseInt(parts[0], 10)
          month = parseInt(parts[1], 10) - 1
          day = parseInt(parts[2], 10)
        } else if (parts[2].length === 4) {
          // Assume DD.MM.YYYY
          day = parseInt(parts[0], 10)
          month = parseInt(parts[1], 10) - 1
          year = parseInt(parts[2], 10)
        }

        if (year !== undefined && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day)
        }
      }
    }
    
    const d = new Date(val)
    return isNaN(d.getTime()) ? undefined : d
  }

  for (const [index, row] of rows.entries()) {
    if (!row || row.length === 0) continue

    try {
      const [
        yearRaw, // New: Year
        admissionNumber,
        nameWithInitialsSi,
        gradeSearchName, // New: శ్ (Grade English Name Search)
        registerStatus, // New: Register (Present: 1/0)
        fullNameSi,
        firstNameSi,
        lastNameSi,
        fullNameEn,
        dobRaw,
        sex,
        birthCertificateNumber,
        admissionDateRaw,
        admittedGradeName,
        addressSi,
        whatsappNumber,
        emergencyNumber,
        email,
        medium,
        motherNameEn,
        motherNumber,
        motherOccupation,
        fatherNameEn,
        fatherNumber,
        fatherOccupation,
        guardianName, // New in list but was in old? Matched to last 3 columns
        guardianNumber,
        guardianOccupation,
      ] = row

      if (!admissionNumber) continue

      const dob = parseDate(dobRaw)
      let gradeId

      // 1. Try to calculate grade based on DOB (Priority)
      if (dob) {
        const calculatedGrade = await calculateGrade(schoolId, dob, currentYear)
        if (calculatedGrade) gradeId = calculatedGrade._id
      }

      // 2. If not calculated, try to find grade by name provided in CSV
      // First try the new "English Grade Name" column (gradeSearchName)
      if (!gradeId && gradeSearchName) {
        const g = grades.find(
          (g) =>
            g.nameEn === gradeSearchName ||
            g.nameEn === String(gradeSearchName).trim()
        )
        if (g) gradeId = g._id
      }

      // 3. Fallback to "Admitted Grade" column if still not found
      if (!gradeId && admittedGradeName) {
        const g = grades.find(
          (g) =>
            g.nameEn === admittedGradeName ||
            g.nameSi === admittedGradeName ||
            g.nameEn === String(admittedGradeName)
        )
        if (g) gradeId = g._id
      }

      if (!gradeId) {
        // Skip for now or throw? Let's throw to report error
        throw new Error('Grade could not be determined for student')
      }

      const mapSex = (val) => {
        if (!val) return undefined
        const v = String(val).trim().toLowerCase()
        if (['male', 'm', 'පුරුෂ'].includes(v)) return 'male'
        if (['female', 'f', 'woman', 'ස්​ත්‍රී', 'ස්ත්‍රී'].includes(v)) return 'female'
        return v
      }

      const mapMedium = (val) => {
        if (!val) return undefined
        const v = String(val).trim().toLowerCase()
        if (['sinhala', 'sin', 'සිංහල'].includes(v)) return 'sinhala'
        if (['english', 'eng', 'ඉංග්‍රීසි'].includes(v)) return 'english'
        if (['tamil', 'tam', 'දෙමළ'].includes(v)) return 'tamil'
        return v
      }

      // Map Register 1 -> true, 0 -> false. Default to true if missing? 
      // User said "Register - present 1 = true 0 = false"
      let isPresent = true
      if (registerStatus !== undefined && registerStatus !== null && registerStatus !== '') {
         const r = String(registerStatus).trim()
         if (r === '0' || r.toLowerCase() === 'false') isPresent = false
      }

      const admissionYear = yearRaw ? parseInt(String(yearRaw).trim(), 10) : undefined

      const payload = {
        admissionNumber: String(admissionNumber),
        nameWithInitialsSi,
        fullNameSi,
        firstNameSi,
        lastNameSi,
        fullNameEn,
        dob,
        sex: mapSex(sex),
        birthCertificateNumber: String(birthCertificateNumber || ''),
        admissionDate: parseDate(admissionDateRaw),
        // If year is provided map it, otherwise maybe it's derived from admissionDate?
        // Model has `admissionYear`.
        admissionYear: admissionYear || (parseDate(admissionDateRaw) ? parseDate(admissionDateRaw).getFullYear() : undefined), 
        admittedGrade: String(admittedGradeName || ''),
        gradeId,
        addressSi,
        whatsappNumber: String(whatsappNumber || ''),
        emergencyNumber: String(emergencyNumber || ''),
        email,
        medium: mapMedium(medium),
        motherNameEn,
        motherNumber: String(motherNumber || ''),
        motherOccupation,
        fatherNameEn,
        fatherNumber: String(fatherNumber || ''),
        fatherOccupation,
        // Guardian details were in last 3 cols of input?
        // Note: The destructuring above captured them.
        academicYear: currentYear, 
        present: isPresent,
        status: isPresent ? 'active' : 'inactive',
      }

      // Helper to handle duplicates or updates
      await Student.findOneAndUpdate(
        { schoolId, admissionNumber: String(admissionNumber) },
        {
          $set: { ...payload, updatedById: userId },
          $setOnInsert: { createdById: userId, schoolId },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )

      results.success++
    } catch (err) {
      results.failed++
      results.errors.push({
        row: index + 2,
        error: err.message,
        admissionNumber: row ? row[1] : 'Unknown', // admissionNumber is at index 1 now
      })
    }
  }

  return results
}

exports.listStudents = async ({
  schoolId,
  page = 1,
  limit = 10,
  search = '',
  gradeId,
  sectionId,
  academicYear,
  sex,
  birthYear,
  admittedYear,
  restrictedGradeIds,
}) => {
  const q = { schoolId }

  await applyCohortFilter(q, schoolId, gradeId, academicYear, restrictedGradeIds)

  if (sectionId) q.sectionId = sectionId
  if (sex) q.sex = sex

  if (birthYear) {
    const start = new Date(`${birthYear}-01-01`)
    const end = new Date(`${birthYear}-12-31`)
    q.dob = { $gte: start, $lte: end }
  }

  if (admittedYear) {
    const start = new Date(`${admittedYear}-01-01`)
    const end = new Date(`${admittedYear}-12-31`)
    q.admissionDate = { $gte: start, $lte: end }
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i')
    q.$or = [
      { firstNameEn: searchRegex },
      { lastNameEn: searchRegex },
      { fullNameEn: searchRegex },
      { fullNameSi: searchRegex },
      { admissionNumber: searchRegex },
      { phoneNum: searchRegex },
      { whatsappNumber: searchRegex },
    ]
  }

  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    Student.find(q)
      .sort({ admissionNumber: 1 })
      .skip(skip)
      .limit(limit)
      .populate('gradeId', 'nameEn level')
      .populate('sectionId', 'nameEn')
      .lean(),
    Student.countDocuments(q),
  ])

  return {
    items: items.map((item) => ({ ...item, id: item._id })),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  }
}

exports.listStudentsByGrade = async ({ schoolId, gradeId, academicYear, restrictedGradeIds }) => {
  const q = { schoolId }

  await applyCohortFilter(q, schoolId, gradeId, academicYear, restrictedGradeIds)

  const items = await Student.find(q)
    .sort({ admissionNumber: 1 })
    .populate('sectionId', 'nameEn')
    .lean()

  return items.map((item) => ({ ...item, id: item._id }))
}


exports.updateStudentBasicInfo = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true, runValidators: true }
    )
    if (!updated) throw new ApiError(404, 'Student not found')
    return updated.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.deleteStudent = async ({ schoolId, id }) => {
  const deleted = await Student.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Student not found')
  return true
}

exports.addStudentNote = async ({ schoolId, id, payload, userId }) => {
  const student = await Student.findOne({ _id: id, schoolId })
  if (!student) throw new ApiError(404, 'Student not found')

  student.notes.push({
    createdById: userId,
    category: payload.category || 'other',
    content: payload.content,
  })

  await student.save()
  return student.toJSON()
}

exports.removeStudentNote = async ({ schoolId, id, noteId }) => {
  const student = await Student.findOne({ _id: id, schoolId })
  if (!student) throw new ApiError(404, 'Student not found')

  const before = student.notes.length
  student.notes = student.notes.filter((n) => String(n._id) !== String(noteId))

  if (student.notes.length === before) {
    throw new ApiError(404, 'Note not found')
  }

  await student.save()
  return student.toJSON()
}

/**
 * Student 360 view (year-wise aggregation).
 * Returns a composed object using other collections.
 * If some collections are empty/not yet used, arrays return empty.
 */
exports.getStudent360 = async ({ schoolId, id, year }) => {
  const student = await Student.findOne({ _id: id, schoolId }).lean()
  if (!student) throw new ApiError(404, 'Student not found')

  const y = year ? Number(year) : undefined

  const [
    attendance,
    examResults,
    houseHistory,
    competitions,
    competitionWins,
    teams,
    higherTeams,
    clubs,
    prefectHistory,
    events,
    talents,
  ] = await Promise.all([
    Attendance.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    ExamResult.find({
      schoolId,
      ...(y ? { year: y } : {}),
      'results.studentId': id,
    }).lean(),

    StudentHouseAssignment.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    CompetitionRegistration.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    CompetitionResult.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    CompetitionTeam.find({
      schoolId,
      memberStudentIds: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    TeamSelection.find({
      schoolId,
      ...(y ? { year: y } : {}),
      'entries.studentId': id,
    }).lean(),

    Club.find({
      schoolId,
      'members.studentId': id,
    }).lean(),

    Prefect.find({
      schoolId,
      ...(y ? { year: y } : {}),
      'students.studentId': id,
    }).lean(),

    EventRegistration.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    StudentTalent.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),
  ])

  return {
    student,
    attendance,
    examResults,
    houseHistory,
    competitions,
    competitionWins,
    teams,
    higherTeams,
    clubs,
    prefectHistory,
    events,
    talents,
  }
}
