const service = require('../../services/student/attendance-dashboard.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.getAttendanceDashboardStats = asyncHandler(async (req, res) => {
  const stats = await service.getAttendanceDashboardStats({
    schoolId: req.schoolId,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  })
  res.json(ApiResponse.ok(stats))
})
