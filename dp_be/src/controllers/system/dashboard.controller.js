const service = require('../../services/system/dashboard.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.getDashboardData = asyncHandler(async (req, res) => {
  const result = await service.getDashboardData({
    schoolId: req.schoolId
  })
  res.json(ApiResponse.ok(result))
})
