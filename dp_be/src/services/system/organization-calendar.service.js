const OrganizationCalendar = require('../../models/system/organization-calendar.model')
const Event = require('../../models/activities/event.model')
const Exam = require('../../models/student/exam.model')
const Competition = require('../../models/housemeets/competition.model')
const ApiError = require('../../utils/apiError')

exports.getCalendarRange = async ({ schoolId, startDate, endDate }) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const [calendarEntries, events, exams, competitions] = await Promise.all([
    OrganizationCalendar.find({
      schoolId,
      date: { $gte: start, $lte: end }
    }).lean(),

    Event.find({
      schoolId,
      date: { $gte: start, $lte: end }
    }).lean(),

    Exam.find({
      schoolId,
      date: { $gte: start, $lte: end }
    }).lean(),

    Competition.find({
      schoolId,
      date: { $gte: start, $lte: end }
    }).lean()
  ])

  const unified = []

  // Map Organization Calendar entries
  calendarEntries.forEach(entry => {
    unified.push({
      id: entry._id,
      date: entry.date,
      type: entry.type,
      label: entry.label,
      source: 'organization',
      startTime: entry.startTime,
      endTime: entry.endTime
    })
  })

  // Map Events
  events.forEach(event => {
    unified.push({
      id: event._id,
      date: event.date,
      type: 'SpecialEvent',
      label: event.nameEn,
      source: 'event',
      startTime: event.startTime,
      endTime: event.endTime,
      metadata: {
        description: event.descriptionEn,
        eventType: event.eventType
      }
    })
  })

  // Map Exams
  exams.forEach(exam => {
    unified.push({
      id: exam._id,
      date: exam.date,
      type: 'SpecialEvent',
      label: `Exam: ${exam.nameEn}`,
      source: 'exam',
      metadata: {
        examType: exam.type
      }
    })
  })

  // Map Competitions
  competitions.forEach(comp => {
    unified.push({
      id: comp._id,
      date: comp.date,
      type: 'Competition',
      label: `Competition: ${comp.nameEn}`,
      source: 'competition',
      startTime: comp.startTime,
      endTime: comp.endTime,
      metadata: {
        competitionId: comp._id,
        participationType: comp.participationType,
        squadId: comp.squadId
      }
    })
  })

  return unified.sort((a, b) => new Date(a.date) - new Date(b.date))
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
