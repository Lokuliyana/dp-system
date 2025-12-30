const mongoose = require('mongoose')
const Grade = require('../../models/system/grade.model')
const ApiError = require('../../utils/apiError')

function handleDuplicate(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Grade already exists in this school')
  }
  throw err
}

exports.createGrade = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Grade.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.listGradesWithStats = async ({ schoolId, year, restrictedGradeIds }) => {
  const y = year ? Number(year) : null
  const sid = new mongoose.Types.ObjectId(schoolId)

  const match = { schoolId: sid }
  if (restrictedGradeIds) {
    match._id = { $in: restrictedGradeIds.map(id => new mongoose.Types.ObjectId(id)) }
  }

  const pipeline = [
    { $match: match },
    { $sort: { level: 1 } },

    // lookup students for counts without requiring Student model yet
    {
      $lookup: {
        from: 'students',
        let: { gid: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$gradeId', '$$gid'] },
              ...(y ? { academicYear: y } : {}),
              schoolId: sid,
            },
          },
          { $count: 'count' },
        ],
        as: 'studentCounts',
      },
    },
    {
      $addFields: {
        studentCount: {
          $ifNull: [{ $arrayElemAt: ['$studentCounts.count', 0] }, 0],
        },
      },
    },
    { $project: { studentCounts: 0 } },
  ]

  const items = await Grade.aggregate(pipeline)
  return items.map(item => ({ ...item, id: item._id }))
}


exports.updateGrade = async ({ schoolId, id, payload, userId }) => {
  try {
    const existing = await Grade.findOne({ _id: id, schoolId })
    if (!existing) throw new ApiError(404, 'Grade not found')

    // If classTeacherId changes and pastTeachers not explicitly provided,
    // append old teacher to history with current year as fromYear.
    const hasTeacherChange =
      payload.classTeacherId &&
      existing.classTeacherId &&
      payload.classTeacherId.toString() !== existing.classTeacherId.toString()

    if (hasTeacherChange && !payload.pastTeachers) {
      const currentYear = new Date().getFullYear()
      existing.pastTeachers.push({
        teacherId: existing.classTeacherId,
        fromYear: currentYear,
      })
      await existing.save()
    }

    const updated = await Grade.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    return updated.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.deleteGrade = async ({ schoolId, id }) => {
  const deleted = await Grade.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Grade not found')
  return true
}
