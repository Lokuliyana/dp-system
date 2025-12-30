const sectionService = require('../../services/system/section.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createSection = asyncHandler(async (req, res) => {
  const section = await sectionService.createSection({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id
  })
  res.status(201).json(ApiResponse.created(section))
})

exports.listSections = asyncHandler(async (req, res) => {
  const items = await sectionService.listSections({
    schoolId: req.schoolId,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })
  res.json(ApiResponse.ok(items))
})

exports.listSectionsByGrade = asyncHandler(async (req, res) => {
  const items = await sectionService.listSectionsByGrade({
    schoolId: req.schoolId,
    gradeId: req.query.gradeId,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })
  res.json(ApiResponse.ok(items))
})


exports.updateSection = asyncHandler(async (req, res) => {
  const section = await sectionService.updateSection({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id
  })
  res.json(ApiResponse.ok(section))
})

exports.deleteSection = asyncHandler(async (req, res) => {
  await sectionService.deleteSection({
    schoolId: req.schoolId,
    id: req.params.id
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
