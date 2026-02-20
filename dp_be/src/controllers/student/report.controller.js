const service = require('../../services/student/report.service')
const pdfService = require('../../services/system/pdf.service')
const School = require('../../models/system/school.model')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

const getSchoolData = async (schoolId) => {
  const school = await School.findById(schoolId).lean()
  return {
    schoolName: school?.nameSi || school?.nameEn || 'Dharmapala Vidyalaya',
    schoolAddress: school?.addressSi || school?.addressEn || 'Pannipitiya, Sri Lanka'
  }
}

exports.reportStudent = asyncHandler(async (req, res) => {
  const data = await service.reportStudent({
    schoolId: req.schoolId,
    studentId: req.params.id,
  })

  if (req.query.format === 'pdf') {
    const schoolInfo = await getSchoolData(req.schoolId)
    const pdf = await pdfService.generatePdf('base', {
      title: `Student Report - ${data.student.nameWithInitialsSi || data.student.fullNameEn}`,
      ...schoolInfo,
      summaryItems: [
        { label: 'Admission No', value: data.student.admissionNumber },
        { label: 'Attendance %', value: data.attendance.percentage + '%' },
        { label: 'Exams Run', value: data.examResults.length },
      ],
      columns: [
        { label: 'Exam Name', key: 'examName' },
        { label: 'Date', key: 'date' },
        { label: 'Result', key: 'result' },
      ],
      rows: data.examResults.map(r => ({
        examName: r.nameEn,
        date: new Date(r.date).toLocaleDateString(),
        result: 'See Details'
      }))
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=student_${req.params.id}.pdf`)
    return res.send(pdf)
  }

  res.json(ApiResponse.ok(data))
})

exports.reportGrade = asyncHandler(async (req, res) => {
  const data = await service.reportGrade({
    schoolId: req.schoolId,
    gradeId: req.params.id,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })

  if (req.query.format === 'pdf') {
    const schoolInfo = await getSchoolData(req.schoolId)
    const pdf = await pdfService.generatePdf('base', {
      title: `Grade Report - ${data.grade.nameEn}`,
      ...schoolInfo,
      summaryItems: [
        { label: 'Grade', value: data.grade.nameEn },
        { label: 'Total Students', value: data.studentCount },
      ],
      columns: [
        { label: 'Admission No', key: 'admissionNumber' },
        { label: 'Name (Sinhala)', key: 'nameWithInitialsSi' },
        { label: 'Name (English)', key: 'fullNameEn' },
        { label: 'Sex', key: 'sex' },
        { label: 'Status', key: 'status' },
      ],
      rows: data.students.map(s => ({
        admissionNumber: s.admissionNumber,
        nameWithInitialsSi: s.nameWithInitialsSi || '-',
        fullNameEn: s.fullNameEn || '-',
        sex: s.sex || '-',
        status: s.status || 'active'
      }))
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=grade_${req.params.id}.pdf`)
    return res.send(pdf)
  }

  res.json(ApiResponse.ok(data))
})


exports.reportTeacher = asyncHandler(async (req, res) => {
  const data = await service.reportTeacher({
    schoolId: req.schoolId,
    teacherId: req.params.id,
  })

  if (req.query.format === 'pdf') {
    const schoolInfo = await getSchoolData(req.schoolId)
    const pdf = await pdfService.generatePdf('base', {
      title: `Teacher Report - ${data.teacher.nameWithInitials || data.teacher.fullNameEn}`,
      ...schoolInfo,
      summaryItems: [
        { label: 'NIC', value: data.teacher.nic || 'N/A' },
        { label: 'Roles', value: data.teacher.roles?.map(r => r.nameEn).join(', ') || 'N/A' },
      ],
      columns: [
        { label: 'Field', key: 'field' },
        { label: 'Details', key: 'value' },
      ],
      rows: [
        { field: 'Full Name', value: data.teacher.fullNameEn },
        { field: 'Phone', value: data.teacher.phone || '-' },
        { field: 'Email', value: data.teacher.email || '-' },
        { field: 'Address', value: data.teacher.address || '-' },
      ]
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=teacher_${req.params.id}.pdf`)
    return res.send(pdf)
  }

  res.json(ApiResponse.ok(data))
})

exports.reportHouse = asyncHandler(async (req, res) => {
  const data = await service.reportHouse({
    schoolId: req.schoolId,
    houseId: req.params.id,
  })

  if (req.query.format === 'pdf') {
    const schoolInfo = await getSchoolData(req.schoolId)
    const pdf = await pdfService.generatePdf('base', {
      title: `House Report - ${data.house.nameEn}`,
      ...schoolInfo,
      summaryItems: [
        { label: 'House Name', value: data.house.nameEn },
        { label: 'Color', value: data.house.color },
      ],
      columns: [
        { label: 'Field', key: 'field' },
        { label: 'Details', key: 'value' },
      ],
      rows: [
        { field: 'Name (Sinhala)', value: data.house.nameSi },
        { field: 'Color Code', value: data.house.color },
      ]
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=house_${req.params.id}.pdf`)
    return res.send(pdf)
  }

  res.json(ApiResponse.ok(data))
})

exports.reportTeams = asyncHandler(async (req, res) => {
  const data = await service.reportTeams({
    schoolId: req.schoolId,
  })

  if (req.query.format === 'pdf') {
    const schoolInfo = await getSchoolData(req.schoolId)
    const pdf = await pdfService.generatePdf('base', {
      title: `Championship Selections Report`,
      ...schoolInfo,
      summaryItems: [
        { label: 'Zonal Teams', value: data.zonal.length },
        { label: 'District Teams', value: data.district.length },
        { label: 'National Teams', value: data.allisland.length },
      ],
      columns: [
        { label: 'Level', key: 'level' },
        { label: 'Year', key: 'year' },
        { label: 'Status', key: 'status' },
      ],
      rows: [
        ...data.zonal.map(t => ({ level: 'Zonal', year: t.year, status: 'Active' })),
        ...data.district.map(t => ({ level: 'District', year: t.year, status: 'Active' })),
        ...data.allisland.map(t => ({ level: 'National', year: t.year, status: 'Active' })),
      ]
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=teams.pdf`)
    return res.send(pdf)
  }

  res.json(ApiResponse.ok(data))
})
