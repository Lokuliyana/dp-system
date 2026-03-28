const schoolService = require('../../services/system/school.service')
const ApiResponse = require('../../utils/apiResponse')
const catchAsync = require('../../utils/catchAsync')

exports.getSchoolConfig = catchAsync(async (req, res) => {
  const config = await schoolService.getSchoolConfig({ schoolId: req.user.schoolId })
  res.json(ApiResponse.ok(config))
})

exports.updateSchoolConfig = catchAsync(async (req, res) => {
  const config = await schoolService.updateSchoolConfig({
    schoolId: req.user.schoolId,
    payload: req.body,
    userId: req.user._id,
  })
  res.json(ApiResponse.ok(config))
})
