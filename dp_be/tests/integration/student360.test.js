const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../../src/app')
const setup = require('../setup')
const env = require('../../src/config/env')
const AppUser = require('../../src/models/system/appUser.model')
const Prefect = require('../../src/models/staff/prefect.model')

// Mock user and auth setup
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
    // Ensure role
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

describe('Student 360 View - Prefect History Fix', () => {
    let gradeId
    let studentId
    let prefectYearId
    let positionId

    beforeEach(async () => {
        // 1. Create Grade
        const gradeRes = await request(app)
            .post(`${env.apiPrefix}/grades`)
            .set('Authorization', authHeader)
            .send({
                nameSi: 'Grade 10',
                nameEn: 'Grade 10',
                level: 10,
            })
        gradeId = gradeRes.body.data.id

        // 2. Create Student
        const studentRes = await request(app)
            .post(`${env.apiPrefix}/students`)
            .set('Authorization', authHeader)
            .send({
                firstNameEn: 'John',
                lastNameEn: 'Doe',
                firstNameSi: 'ජෝන්',
                lastNameSi: 'ඩෝ',
                fullNameSi: 'ජෝන් ඩෝ',
                nameWithInitialsSi: 'ජේ. ඩෝ',
                fullNameEn: 'John Doe', // Correct Name
                sex: 'male',
                admissionNumber: `ADM-${uniqueSuffix()}`,
                admissionDate: new Date().toISOString(),
                dob: new Date('2010-01-01').toISOString(),
                gradeId,
                academicYear: 2024,
                admissionYear: 2024,
            })
        studentId = studentRes.body.data.id

        // 3. Create Prefect Position
        const positionRes = await request(app)
            .post(`${env.apiPrefix}/prefect-positions`)
            .set('Authorization', authHeader)
            .send({
                nameSi: 'Head',
                nameEn: 'Head',
                responsibilityEn: 'Lead',
                rankLevel: 1
            })
        positionId = positionRes.body.data.id

        // 4. Create Prefect Year
        const yearRes = await request(app)
            .post(`${env.apiPrefix}/prefects`)
            .set('Authorization', authHeader)
            .send({
                year: 2024,
                appointedDate: new Date().toISOString(),
            })
        prefectYearId = yearRes.body.data.id
    })

    it('should patch "undefined undefined" name in getStudent360 response', async () => {
        // Manually corrupt data: insert a prefect record with bad name
        const prefect = await Prefect.findById(prefectYearId)
        prefect.students.push({
            studentId,
            studentNameEn: 'undefined undefined', // Simulate the bug
            studentNameSi: 'undefined undefined',
            rank: 'prefect',
            positionIds: [positionId]
        })
        await prefect.save()

        // Call 360 view
        const res = await request(app)
            .get(`${env.apiPrefix}/students/${studentId}/360`)
            .set('Authorization', authHeader)

        expect(res.statusCode).toBe(200)
        const history = res.body.data.prefectHistory
        expect(history).toHaveLength(1)
        const entry = history[0].students.find(s => s.studentId === studentId)

        // This assertion will FAIL if the bug exists. Pass if fix works.
        expect(entry.studentNameEn).toBe('John Doe')
    })

    it('should enforce correct student name when adding a prefect student', async () => {
        // Call API with WRONG name in payload
        const res = await request(app)
            .post(`${env.apiPrefix}/prefects/${prefectYearId}/students`)
            .set('Authorization', authHeader)
            .send({
                studentId,
                studentNameEn: 'Wrong Name', // Should be ignored
                studentNameSi: 'Wrong Name', // Should be ignored
                rank: 'prefect',
                positionIds: [positionId]
            })

        expect(res.statusCode).toBe(200)

        // Verify in DB
        const prefect = await Prefect.findById(prefectYearId)
        const entry = prefect.students.find(s => s.studentId.toString() === studentId)

        expect(entry.studentNameEn).toBe('John Doe') // Should fetch real name
    })
})
