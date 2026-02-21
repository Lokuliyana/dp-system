const service = require('../../services/student/report.service')
const pdfService = require('../../services/system/pdf.service')
const School = require('../../models/system/school.model')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')
const xlsx = require('xlsx')

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
    return res.end(pdf, 'binary')
  }

  res.json(ApiResponse.ok(data))
})

exports.reportGrade = asyncHandler(async (req, res) => {
  const data = await service.reportGrade({
    schoolId: req.schoolId,
    gradeId: req.params.id,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })

  if (req.query.format === 'pdf' || req.query.format === 'xlsx') {
    const EXPORT_MAP = {
      academicYear: { label: 'Year', getValue: s => s.academicYear || s.admissionYear || '-' },
      admissionNumber: { label: 'ඇතුළත් වීමේ අංකය', getValue: s => s.admissionNumber || '-' },
      nameWithInitialsSi: { label: 'මුලකුරු සහිත නම', getValue: s => s.nameWithInitialsSi || '-' },
      gradeSearchName: { label: 'ශ් (Grade)', getValue: s => data.grade.nameSi || data.grade.nameEn || '-' },
      status: { label: 'Register (Present: 1/0)', getValue: s => (s.status === 'active' || s.present) ? '1' : '0' },
      fullNameSi: { label: 'සම්පූර්ණ නම', getValue: s => s.fullNameSi || '-' },
      firstNameSi: { label: 'මුල් නම', getValue: s => s.firstNameSi || '-' },
      lastNameSi: { label: 'වාසගම', getValue: s => s.lastNameSi || '-' },
      fullNameEn: { label: 'Full Name', getValue: s => s.fullNameEn || '-' },
      dob: { label: 'උපන් දිනය', getValue: s => s.dob ? new Date(s.dob).toISOString().split('T')[0] : '-' },
      sex: { label: 'ස්ත්‍රී පුරුෂ භාවය', getValue: s => s.sex === 'male' ? 'පුරුෂ' : (s.sex === 'female' ? 'ස්ත්‍රී' : '-') },
      birthCertificateNumber: { label: 'උප්පැන්න සහතික අංකය', getValue: s => s.birthCertificateNumber || '-' },
      admissionDate: { label: 'ඇතුළත් වීමේ දිනය', getValue: s => s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '-' },
      admittedGrade: { label: 'ඇතුළත් ශ්', getValue: s => s.admittedGrade || '-' },
      addressSi: { label: 'ලිපිනය', getValue: s => s.addressSi || '-' },
      whatsappNumber: { label: 'whatapp දුරකතන අංකය', getValue: s => s.whatsappNumber || '-' },
      emergencyNumber: { label: 'හදිසියකදි දැනුම් දිය යුතු අංකය', getValue: s => s.emergencyNumber || '-' },
      email: { label: 'විද්‍යුත් තැපෑල', getValue: s => s.email || '-' },
      medium: { label: 'මාධ්‍ය', getValue: s => s.medium === 'sinhala' ? 'සිංහල' : (s.medium === 'english' ? 'ඉංග්‍රීසි' : (s.medium === 'tamil' ? 'දෙමළ' : '-')) },
      motherNameEn: { label: 'මවගේ නම', getValue: s => s.motherNameEn || '-' },
      motherNumber: { label: 'මවගේ දුරකතන අංකය', getValue: s => s.motherNumber || '-' },
      motherOccupation: { label: 'මවගේ රැකියාව', getValue: s => s.motherOccupation || '-' },
      fatherNameEn: { label: 'පියාගේ නම', getValue: s => s.fatherNameEn || '-' },
      fatherNumber: { label: 'පියාගේ දුරකතන අංකය', getValue: s => s.fatherNumber || '-' },
      fatherOccupation: { label: 'පියාගේ රැකියාව', getValue: s => s.fatherOccupation || '-' },
      guardianName: { label: 'භාරකරුගේ නම', getValue: s => '-' },
      guardianNumber: { label: 'භාරකරුගේ දුරකතන අංකය', getValue: s => '-' },
      guardianOccupation: { label: 'භාරකරුගේ රැකියාව', getValue: s => '-' },
    }

    const requestedFields = req.query.fields 
      ? req.query.fields.split(',') 
      : ['admissionNumber', 'nameWithInitialsSi', 'fullNameEn', 'sex', 'status']

    const columns = []
    const fieldsToUse = []

    requestedFields.forEach(field => {
      if (EXPORT_MAP[field]) {
         columns.push({ label: EXPORT_MAP[field].label, key: field })
         fieldsToUse.push(field)
      }
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
        columns: columns,
        rows: data.students.map(s => {
          const row = {}
          fieldsToUse.forEach(f => {
            row[f] = EXPORT_MAP[f].getValue(s)
          })
          return row
        })
      })
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=grade_${req.params.id}.pdf`)
      return res.end(pdf, 'binary')
    }

    if (req.query.format === 'xlsx') {
      const rows = data.students.map(s => {
        const row = {}
        fieldsToUse.forEach(f => {
          row[EXPORT_MAP[f].label] = EXPORT_MAP[f].getValue(s)
        })
        return row
      })
      const ws = xlsx.utils.json_to_sheet(rows)
      const wb = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(wb, ws, "Students")
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=grade_${req.params.id}.xlsx`)
      return res.end(buffer, 'binary')
    }
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
    return res.end(pdf, 'binary')
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
    return res.end(pdf, 'binary')
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
    return res.end(pdf, 'binary')
  }

  res.json(ApiResponse.ok(data))
})
