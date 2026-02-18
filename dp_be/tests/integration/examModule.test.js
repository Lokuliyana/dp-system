const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../../src/app')
const setup = require('../setup')
const env = require('../../src/config/env')
const AppUser = require('../../src/models/system/appUser.model')

// Mock data
let authHeader
const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'super_admin',
    schoolId: new mongoose.Types.ObjectId(),
    permissions: ['*'],
    isActive: true,
    name: 'Test Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    roleId: new mongoose.Types.ObjectId()
}
const uniqueSuffix = () => new mongoose.Types.ObjectId().toString().slice(-6)

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
    // Ensure we have a valid role first
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

    // Check if user exists before creating
    const existingUser = await AppUser.findById(mockUser._id)
    if (!existingUser) {
        await AppUser.create(mockUser)
    }
})

afterEach(async () => {
    await setup.clear()
})

afterAll(async () => {
    await setup.close()
})

describe('Exam Module Integration Tests', () => {
    let gradeId
    let studentId1
    let studentId2

    beforeEach(async () => {
        // 1. Create Grade
        const gradeRes = await request(app)
            .post(`${env.apiPrefix}/grades`)
            .set('Authorization', authHeader)
            .send({
                nameSi: 'Grade 10',
                nameEn: 'Grade 10',
                level: 10
            })
        gradeId = gradeRes.body.data.id

        // 2. Create Students
        const s1 = await request(app)
            .post(`${env.apiPrefix}/students`)
            .set('Authorization', authHeader)
            .send({
                firstNameEn: 'Student 1',
                lastNameEn: 'Test',
                firstNameSi: 'Student 1',
                lastNameSi: 'Test',
                fullNameSi: 'Student 1 Test',
                nameWithInitialsSi: 'S. Test',
                fullNameEn: 'Student 1 Test',
                sex: 'male',
                admissionNumber: `ST1-${uniqueSuffix()}`,
                admissionDate: new Date().toISOString(),
                dob: new Date('2010-01-01').toISOString(),
                gradeId,
                academicYear: 2024
            })
        studentId1 = s1.body.data.id

        const s2 = await request(app)
            .post(`${env.apiPrefix}/students`)
            .set('Authorization', authHeader)
            .send({
                firstNameEn: 'Student 2',
                lastNameEn: 'Test',
                firstNameSi: 'Student 2',
                lastNameSi: 'Test',
                fullNameSi: 'Student 2 Test',
                nameWithInitialsSi: 'S. Test',
                fullNameEn: 'Student 2 Test',
                sex: 'female',
                admissionNumber: `ST2-${uniqueSuffix()}`,
                admissionDate: new Date().toISOString(),
                dob: new Date('2010-01-01').toISOString(),
                gradeId,
                academicYear: 2024
            })
        studentId2 = s2.body.data.id
    })

    it('should create an exam', async () => {
        const res = await request(app)
            .post(`${env.apiPrefix}/exams`)
            .set('Authorization', authHeader)
            .send({
                name: 'Term 1 Exam',
                date: new Date().toISOString(),
                gradeIds: [gradeId],
                year: 2024,
                type: 'exam'
            })

        expect(res.statusCode).toBe(201)
        expect(res.body.data.name).toBe('Term 1 Exam')
    })

    it('should list exams', async () => {
        await request(app)
            .post(`${env.apiPrefix}/exams`)
            .set('Authorization', authHeader)
            .send({
                name: 'Term 1 Exam',
                date: new Date().toISOString(),
                gradeIds: [gradeId],
                year: 2024
            })

        const res = await request(app)
            .get(`${env.apiPrefix}/exams`)
            .set('Authorization', authHeader)

        expect(res.statusCode).toBe(200)
        expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should get students for mark entry', async () => {
        const examRes = await request(app)
            .post(`${env.apiPrefix}/exams`)
            .set('Authorization', authHeader)
            .send({
                name: 'Maths Test',
                date: new Date().toISOString(),
                gradeIds: [gradeId],
                year: 2024
            })
        const examId = examRes.body.data.id

        const res = await request(app)
            .get(`${env.apiPrefix}/exams/${examId}/marks`)
            .query({ gradeId })
            .set('Authorization', authHeader)

        expect(res.statusCode).toBe(200)
        expect(res.body.data.length).toBe(2) // 2 students
        expect(res.body.data[0].mark).toBe('') // No marks yet
    })

    it('should update marks and retrieve history', async () => {
        const examRes = await request(app)
            .post(`${env.apiPrefix}/exams`)
            .set('Authorization', authHeader)
            .send({
                name: 'Science Test',
                date: new Date().toISOString(),
                gradeIds: [gradeId],
                year: 2024
            })
        const examId = examRes.body.data.id

        // Entry marks
        const updateRes = await request(app)
            .post(`${env.apiPrefix}/exams/${examId}/marks`)
            .set('Authorization', authHeader)
            .send({
                marks: [
                    { studentId: studentId1, gradeId, mark: 85, isPresent: true },
                    { studentId: studentId2, gradeId, isPresent: false, comment: 'Sick' }
                ]
            })

        expect(updateRes.statusCode).toBe(200)

        // Verify marks via mark entry endpoint
        const checkRes = await request(app)
            .get(`${env.apiPrefix}/exams/${examId}/marks`)
            .query({ gradeId })
            .set('Authorization', authHeader)

        const s1Mark = checkRes.body.data.find(r => r.student.id === studentId1)
        const s2Mark = checkRes.body.data.find(r => r.student.id === studentId2)

        expect(s1Mark.mark).toBe(85)
        expect(s2Mark.isPresent).toBe(false)

        // Verify history
        const historyRes = await request(app)
            .get(`${env.apiPrefix}/exams/student/${studentId1}/history`)
            .set('Authorization', authHeader)

        expect(historyRes.statusCode).toBe(200)
        expect(historyRes.body.data.length).toBe(1)
        expect(historyRes.body.data[0].mark).toBe(85)
        expect(historyRes.body.data[0].examId.name).toBe('Science Test')
    })
})
