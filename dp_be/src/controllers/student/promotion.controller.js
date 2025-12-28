const service = require('../../services/student/promotion.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.triggerPromotion = asyncHandler(async (req, res) => {
  const result = await service.promoteStudentsByDOB({
    schoolId: req.schoolId,
    fromYear: req.body.fromYear,
    toYear: req.body.toYear,
    dryRun: req.body.dryRun,
    userId: req.user.id,
  })

  res.json(ApiResponse.ok(result))
})
