const service = require('../services/studentHouseAssignment.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.assignStudentHouse = asyncHandler(async (req, res) => {
  const doc = await service.assignStudentHouse({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(200).json(ApiResponse.ok(doc))
})

exports.removeStudentHouse = asyncHandler(async (req, res) => {
  const { studentId } = req.params
  const { year } = req.query

  await service.removeStudentHouse({
    schoolId: req.schoolId,
    studentId,
    year: Number(year),
  })
  res.status(200).json(ApiResponse.ok({ message: 'Assignment removed' }))
})

exports.bulkAssignStudentHouse = asyncHandler(async (req, res) => {
  const { assignments, year } = req.body

  await service.bulkAssign({
    schoolId: req.schoolId,
    assignments,
    year,
    userId: req.user.id,
  })
  res.status(200).json(ApiResponse.ok({ message: 'Bulk assignments saved' }))
})

exports.listHouseAssignments = asyncHandler(async (req, res) => {
  const items = await service.listHouseAssignments({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})
