const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../../src/app')
const setup = require('../setup')
const env = require('../../src/config/env')
const AppUser = require('../../src/models/system/appUser.model')

jest.setTimeout(30000)

let authHeader
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  role: 'super_admin',
  schoolId: new mongoose.Types.ObjectId(),
  permissions: ['*'],
  isActive: true,
  name: 'Test Admin',
  email: 'analytics-test@example.com',
  password: 'password123',
}

const uniqueSuffix = () => new mongoose.Types.ObjectId().toString().slice(-6)

const createGrade = async (level = 1) => {
  const name = `Grade ${level}-${uniqueSuffix()}`
  const res = await request(app)
    .post(`${env.apiPrefix}/grades`)
    .set('Authorization', authHeader)
    .send({
      nameSi: name,
      nameEn: name,
      level,
    })
  if (res.statusCode !== 201) {
    console.error('Create Grade failed:', res.statusCode, res.body)
  }
  return res.body?.data?.id
}

const createStudent = async (gradeId) => {
  const params = {
    firstNameEn: 'John',
    lastNameEn: 'Doe',
    firstNameSi: 'ජෝන්',
    lastNameSi: 'ඩෝ',
    fullNameSi: 'ජෝන් ඩෝ',
    nameWithInitialsSi: 'ජේ. ඩෝ',
    fullNameEn: 'John Doe',
    sex: 'male',
    admissionNumber: `ADM-${uniqueSuffix()}`,
    admissionDate: new Date().toISOString(),
    admissionYear: 2024,
    dob: new Date('2015-01-01').toISOString(),
    gradeId,
    academicYear: 2024,
  }
  const res = await request(app)
    .post(`${env.apiPrefix}/students`)
    .set('Authorization', authHeader)
    .send(params)
  
  if (res.statusCode !== 201) {
    console.error('Create Student failed:', res.statusCode, res.body)
  }

  return res.body?.data?.id
}


beforeAll(async () => {
  await setup.connect()
  const token = jwt.sign({ 
    id: mockUser._id.toString(), 
    role: mockUser.role, 
    permissions: mockUser.permissions, 
    schoolId: mockUser.schoolId 
  }, env.jwtAccessSecret, { expiresIn: '1h' })
  authHeader = `Bearer ${token}`
})

beforeEach(async () => {
  const Role = require('../../src/models/system/role.model')
  let role = await Role.findOne({ name: 'super_admin' })
  if (!role) {
    role = await Role.create({
      name: 'super_admin',
      schoolId: mockUser.schoolId,
      permissions: ['*']
    })
  }
  mockUser.roleId = role._id
  await AppUser.create(mockUser)
})

afterEach(async () => {
  await setup.clear()
})

afterAll(async () => {
  await setup.close()
})

describe('Analytics Module Integration Tests', () => {
  it('should return analytics for a student', async () => {
    const gradeId = await createGrade(1)
    const studentId = await createStudent(gradeId)
    const year = 2024

    // 1. Mark attendance (Wait, let's create a few present marks)
    const sunday = new Date('2024-02-18') // A Sunday
    await request(app).post(`${env.apiPrefix}/attendance`).set('Authorization', authHeader).send({
      date: sunday.toISOString(),
      studentId,
      gradeId,
      status: 'present',
    })

    // 2. Create an exam
    const examRes = await request(app).post(`${env.apiPrefix}/exams`).set('Authorization', authHeader).send({
      nameSi: 'Test Exam',
      nameEn: 'Test Exam',
      date: new Date().toISOString(),
      year,
      type: 'SRIANANDA',
      gradeIds: [gradeId]
    })
    const examId = examRes.body.data.id

    // 3. Update marks
    await request(app).post(`${env.apiPrefix}/exams/${examId}/marks`).set('Authorization', authHeader).send({
      marks: [{ studentId, gradeId, mark: 85, isPresent: true }]
    })

    const res = await request(app)
      .get(`${env.apiPrefix}/analytics/student/${studentId}`)
      .query({ year })
      .set('Authorization', authHeader)

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveProperty('category')
    expect(res.body.data.metrics.presentCount).toBe(1)
    expect(res.body.data.metrics.markAvg).toBe(85)
    expect(res.body.data.category).toBe('best')
  })

  it('should return analytics for a grade', async () => {
    const gradeId = await createGrade(2)
    const studentId = await createStudent(gradeId)
    const year = 2024

    // Mark attendance
    await request(app).post(`${env.apiPrefix}/attendance`).set('Authorization', authHeader).send({
      date: new Date('2024-02-18').toISOString(),
      studentId,
      gradeId,
      status: 'present',
    })

    // 2. Create an exam
    const examRes = await request(app).post(`${env.apiPrefix}/exams`).set('Authorization', authHeader).send({
      nameSi: 'Grade Exam',
      nameEn: 'Grade Exam',
      date: new Date().toISOString(),
      year,
      type: 'SRIANANDA',
      gradeIds: [gradeId]
    })
    const examId = examRes.body.data.id

    // 3. Update marks
    await request(app).post(`${env.apiPrefix}/exams/${examId}/marks`).set('Authorization', authHeader).send({
      marks: [{ studentId, gradeId, mark: 45, isPresent: true }]
    })

    const res = await request(app)
      .get(`${env.apiPrefix}/analytics/grade/${gradeId}`)
      .query({ year })
      .set('Authorization', authHeader)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.studentCount).toBe(1)
    expect(res.body.data.distribution.normal).toBe(1) // 100% att, 45 mark -> Normal
  })

  it('should return organization-wide analytics', async () => {
    const gradeId = await createGrade(3)
    await createStudent(gradeId)
    const year = 2024

    const res = await request(app)
      .get(`${env.apiPrefix}/analytics/organization`)
      .query({ year })
      .set('Authorization', authHeader)

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveProperty('distribution')
    expect(res.body.data).toHaveProperty('gradeWise')
    expect(Array.isArray(res.body.data.gradeWise)).toBe(true)
  })
})
