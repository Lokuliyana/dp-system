const calendarService = require('../../services/system/organization-calendar.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')
const ApiError = require('../../utils/apiError')

exports.getCalendarRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query
  const items = await calendarService.getCalendarRange({
    schoolId: req.schoolId,
    startDate,
    endDate
  })
  res.json(ApiResponse.ok(items))
})

exports.upsertDayConfig = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'User not authenticated'))
  }

  const item = await calendarService.upsertDayConfig({
    schoolId: req.schoolId,
    date: req.body.date,
    payload: req.body,
    userId: req.user.id
  })
  res.json(ApiResponse.ok(item))
})

exports.deleteDayConfig = asyncHandler(async (req, res) => {
  await calendarService.deleteDayConfig({
    schoolId: req.schoolId,
    date: req.query.date
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
