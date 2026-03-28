const service = require('../../services/housemeets/house-meets-dashboard.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.getHouseDashboardStats = asyncHandler(async (req, res) => {
  const stats = await service.getHouseDashboardStats({
    schoolId: req.schoolId,
    year: req.query.year ? parseInt(req.query.year) : null
  })
  res.json(ApiResponse.ok(stats))
})
