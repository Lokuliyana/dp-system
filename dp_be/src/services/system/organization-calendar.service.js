const OrganizationCalendar = require('../../models/system/organization-calendar.model')
const ApiError = require('../../utils/apiError')

exports.getCalendarRange = async ({ schoolId, startDate, endDate }) => {
  const query = { schoolId }
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }

  const items = await OrganizationCalendar.find(query).sort({ date: 1 })
  return items.map(item => item.toJSON())
}

exports.upsertDayConfig = async ({ schoolId, date, payload, userId }) => {
  // Ensure date is at midnight UTC/local to avoid mismatches
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const updated = await OrganizationCalendar.findOneAndUpdate(
    { schoolId, date: targetDate },
    { 
      ...payload, 
      schoolId, 
      date: targetDate,
      updatedById: userId 
    },
    { new: true, upsert: true, runValidators: true }
  )

  return updated.toJSON()
}

exports.deleteDayConfig = async ({ schoolId, date }) => {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const deleted = await OrganizationCalendar.findOneAndDelete({ schoolId, date: targetDate })
  if (!deleted) throw new ApiError(404, 'Calendar config not found for this date')
  return true
}
