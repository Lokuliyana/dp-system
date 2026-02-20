const service = require('../../services/student/student.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createStudent = asyncHandler(async (req, res) => {
  const doc = await service.createStudent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.bulkImportStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('Please upload a file')
  }
  const result = await service.bulkImportStudents({
    schoolId: req.schoolId,
    fileBuffer: req.file.buffer,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(result))
})

exports.listStudents = asyncHandler(async (req, res) => {
  const data = await service.listStudents({
    schoolId: req.schoolId,
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    gradeId: req.query.gradeId,
    sectionId: req.query.sectionId,
    academicYear: req.query.academicYear,
    sex: req.query.sex,
    birthYear: req.query.birthYear,
    admittedYear: req.query.admittedYear,
    status: req.query.status,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })
  res.json(ApiResponse.ok(data))
})

exports.listStudentsByGrade = asyncHandler(async (req, res) => {
  const items = await service.listStudentsByGrade({
    schoolId: req.schoolId,
    gradeId: req.query.gradeId,
    academicYear: req.query.academicYear,
    sex: req.query.sex,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })
  res.json(ApiResponse.ok(items))
})

exports.listStudentsWithResultsByGrade = asyncHandler(async (req, res) => {
  const items = await service.listStudentsWithResultsByGrade({
    schoolId: req.schoolId,
    gradeId: req.query.gradeId,
    academicYear: req.query.academicYear,
    sex: req.query.sex,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })
  res.json(ApiResponse.ok(items))
})


exports.updateStudentBasicInfo = asyncHandler(async (req, res) => {
  const doc = await service.updateStudentBasicInfo({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteStudent = asyncHandler(async (req, res) => {
  await service.deleteStudent({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})

exports.addStudentNote = asyncHandler(async (req, res) => {
  const doc = await service.addStudentNote({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.removeStudentNote = asyncHandler(async (req, res) => {
  const doc = await service.removeStudentNote({
    schoolId: req.schoolId,
    id: req.params.id,
    noteId: req.params.noteId,
  })
  res.json(ApiResponse.ok(doc))
})

exports.getStudent360 = asyncHandler(async (req, res) => {
  const data = await service.getStudent360({
    schoolId: req.schoolId,
    id: req.params.id,
    year: req.query.year,
  })
  res.json(ApiResponse.ok(data))
})
