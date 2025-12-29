const permissionsConfig = require('../../config/permissions.json')
const ApiResponse = require('../../utils/apiResponse')
const asyncHandler = require('../../middlewares/asyncHandler')

exports.listPermissions = asyncHandler(async (req, res) => {
  res.json(ApiResponse.ok(permissionsConfig))
})
