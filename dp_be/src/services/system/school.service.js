const School = require('../../models/system/school.model')
const ApiError = require('../../utils/apiError')

exports.getSchoolConfig = async ({ schoolId }) => {
  const school = await School.findById(schoolId).select('attendanceConfig').lean()
  if (!school) throw new ApiError(404, 'School not found')
  
  return school.attendanceConfig || {
    allowedDayOfWeek: 0,
    startTime: '07:30',
    endTime: '13:00'
  }
}

exports.updateSchoolConfig = async ({ schoolId, payload, userId }) => {
  const updated = await School.findByIdAndUpdate(
    schoolId,
    { $set: { attendanceConfig: payload, updatedById: userId } },
    { new: true, runValidators: true }
  ).select('attendanceConfig').lean()

  if (!updated) throw new ApiError(404, 'School not found')
  return updated.attendanceConfig
}
