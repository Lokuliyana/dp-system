const permissions = require('../constants/permissions')
const ApiResponse = require('../utils/apiResponse')
const asyncHandler = require('../middlewares/asyncHandler')

exports.listPermissions = asyncHandler(async (req, res) => {
  // Return the raw permissions object (grouped by module)
  res.json(ApiResponse.ok(permissions))
})
