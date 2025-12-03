const Event = require('../models/event.model')
const EventRegistration = require('../models/eventRegistration.model')
const ApiError = require('../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Event already exists for this year')
  }
  throw err
}

/* -------------------- EVENT CRUD -------------------- */

exports.createEvent = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Event.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.listEvents = async ({ schoolId, filters }) => {
  const q = { schoolId }
  if (filters.year) q.year = Number(filters.year)

  return await Event.find(q)
    .sort({ date: 1 })
    .lean()
}

exports.updateEvent = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Event.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )
    if (!updated) throw new ApiError(404, 'Event not found')
    return updated.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.deleteEvent = async ({ schoolId, id }) => {
  const deleted = await Event.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Event not found')
  return true
}

/* -------------------- REGISTRATION -------------------- */

exports.registerStudentForEvent = async ({ schoolId, payload, userId }) => {
  const { eventId, studentId, year } = payload

  try {
    const doc = await EventRegistration.create({
      eventId,
      studentId,
      year,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, 'Student already registered for this event')
    }
    throw err
  }
}

exports.listEventRegistrations = async ({ schoolId, filters }) => {
  const q = { schoolId }
  if (filters.eventId) q.eventId = filters.eventId
  if (filters.studentId) q.studentId = filters.studentId
  if (filters.year) q.year = Number(filters.year)

  return await EventRegistration.find(q)
    .sort({ registeredAt: -1 })
    .lean()
}
