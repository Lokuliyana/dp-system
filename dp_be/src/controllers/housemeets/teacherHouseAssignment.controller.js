const service = require('../../services/housemeets/teacherHouseAssignment.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.assignTeacherHouse = asyncHandler(async (req, res) => {
  const doc = await service.assignTeacherHouse({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(200).json(ApiResponse.ok(doc))
})

exports.listTeacherHouseAssignments = asyncHandler(async (req, res) => {
  const items = await service.listTeacherHouseAssignments({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})
