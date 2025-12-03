const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../../src/app')
const setup = require('../setup')
const env = require('../../src/config/env')

// Mock data
const mockUser = {
  id: new mongoose.Types.ObjectId().toString(),
  role: 'admin',
  schoolId: new mongoose.Types.ObjectId().toString(),
  permissions: ['*'], // Assuming admin has all permissions or we bypass based on role
}

const token = jwt.sign(mockUser, env.jwtAccessSecret, { expiresIn: '1h' })
const authHeader = `Bearer ${token}`
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
  return res.body.data.id
}

const createHouse = async ({ name = 'House', color = 'Blue' } = {}) => {
  const label = `${name}-${uniqueSuffix()}`
  const res = await request(app)
    .post(`${env.apiPrefix}/houses`)
    .set('Authorization', authHeader)
    .send({
      nameSi: label,
      nameEn: label,
      color,
      mottoEn: 'Courage and Honor',
    })
  return res.body.data.id
}

const createStudent = async ({ gradeId, firstNameEn = 'Student', lastNameEn = 'Test', admissionNumber }) => {
  const res = await request(app)
    .post(`${env.apiPrefix}/students`)
    .set('Authorization', authHeader)
    .send({
      firstNameEn,
      lastNameEn,
      admissionNumber: admissionNumber || `ADM-${uniqueSuffix()}`,
      admissionDate: new Date().toISOString(),
      dob: new Date('2015-01-01').toISOString(),
      gradeId,
      academicYear: 2024,
    })

  return res.body.data.id
}

const createSquad = async (name = 'Squad') => {
  const label = `${name}-${uniqueSuffix()}`
  const res = await request(app)
    .post(`${env.apiPrefix}/squads`)
    .set('Authorization', authHeader)
    .send({
      nameSi: label,
      nameEn: label,
      assignedGradeIds: [],
      assignedSectionIds: [],
    })
  return res.body.data.id
}

const createCompetition = async ({ gradeId, squadId, year = 2024, name = 'Competition' }) => {
  const label = `${name}-${uniqueSuffix()}`
  const res = await request(app)
    .post(`${env.apiPrefix}/competitions`)
    .set('Authorization', authHeader)
    .send({
      nameSi: label,
      nameEn: label,
      squadId,
      scope: 'grade',
      gradeIds: [gradeId],
      year,
    })
  return res.body.data.id
}

beforeAll(async () => {
  await setup.connect()
})

afterEach(async () => {
  await setup.clear()
})

afterAll(async () => {
  await setup.close()
})

describe('Student Module Integration Tests', () => {
  let gradeId
  let sectionId
  let studentId

  describe('Grade Routes', () => {
    it('should create a new grade', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/grades`)
        .set('Authorization', authHeader)
        .send({
          nameSi: 'Grade 1',
          nameEn: 'Grade 1',
          level: 1,
        })

      if (res.statusCode !== 201) {
        console.log('Create Grade Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(201)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.nameEn).toBe('Grade 1')
      gradeId = res.body.data.id
    })

    it('should list grades', async () => {
      // Create a grade first
      await request(app).post(`${env.apiPrefix}/grades`).set('Authorization', authHeader).send({
        nameSi: 'Grade 2',
        nameEn: 'Grade 2',
        level: 2,
      })

      const res = await request(app).get(`${env.apiPrefix}/grades`).set('Authorization', authHeader)

      if (res.statusCode !== 200) {
        console.log('List Grades Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('Section Routes', () => {
    it('should create a new section', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/sections`)
        .set('Authorization', authHeader)
        .send({
          nameSi: 'A',
          nameEn: 'A',
        })

      if (res.statusCode !== 201) {
        console.log('Create Section Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(201)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.nameEn).toBe('A')
      sectionId = res.body.data.id
    })

    it('should list sections', async () => {
      // Create a section first
      const createRes = await request(app)
        .post(`${env.apiPrefix}/sections`)
        .set('Authorization', authHeader)
        .send({
          nameSi: 'B',
          nameEn: 'B',
        })
      expect(createRes.statusCode).toBe(201)
      const createdId = createRes.body.data.id

      const res = await request(app)
        .get(`${env.apiPrefix}/sections`)
        .set('Authorization', authHeader)

      if (res.statusCode !== 200) {
        console.log('List Sections Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.find((s) => s.id === createdId)).toBeDefined()
    })
  })

  describe('Student Routes', () => {
    beforeEach(async () => {
      // Create a grade for student tests
      const gradeRes = await request(app)
        .post(`${env.apiPrefix}/grades`)
        .set('Authorization', authHeader)
        .send({
          nameSi: 'Grade 3',
          nameEn: 'Grade 3',
          level: 3,
        })
      gradeId = gradeRes.body.data.id
    })

    it('should create a new student', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/students`)
        .set('Authorization', authHeader)
        .send({
          firstNameEn: 'John',
          lastNameEn: 'Doe',
          admissionNumber: '12345',
          admissionDate: new Date().toISOString(),
          dob: new Date('2015-01-01').toISOString(),
          gradeId: gradeId,
          academicYear: 2024,
        })

      if (res.statusCode !== 201) {
        console.log('Create Student Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(201)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.firstNameEn).toBe('John')
      studentId = res.body.data.id
    })

    it('should list students by grade', async () => {
      // Create a student first
      await request(app)
        .post(`${env.apiPrefix}/students`)
        .set('Authorization', authHeader)
        .send({
          firstNameEn: 'Jane',
          lastNameEn: 'Doe',
          admissionNumber: '67890',
          admissionDate: new Date().toISOString(),
          dob: new Date('2015-02-01').toISOString(),
          gradeId: gradeId,
          academicYear: 2024,
        })

      const res = await request(app)
        .get(`${env.apiPrefix}/students`)
        .query({ gradeId: gradeId })
        .set('Authorization', authHeader)

      if (res.statusCode !== 200) {
        console.log('List Students Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should update student basic info', async () => {
      // Create student
      const createRes = await request(app)
        .post(`${env.apiPrefix}/students`)
        .set('Authorization', authHeader)
        .send({
          firstNameEn: 'Update',
          lastNameEn: 'Me',
          admissionNumber: 'UP123',
          admissionDate: new Date().toISOString(),
          dob: new Date('2015-01-01').toISOString(),
          gradeId: gradeId,
          academicYear: 2024,
        })
      const sId = createRes.body.data.id

      const res = await request(app)
        .patch(`${env.apiPrefix}/students/${sId}`)
        .set('Authorization', authHeader)
        .send({
          firstNameEn: 'Updated',
        })

      if (res.statusCode !== 200) {
        console.log('Update Student Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(200)
      expect(res.body.data.firstNameEn).toBe('Updated')
    })

    it('should delete a student', async () => {
      // Create student
      const createRes = await request(app)
        .post(`${env.apiPrefix}/students`)
        .set('Authorization', authHeader)
        .send({
          firstNameEn: 'Delete',
          lastNameEn: 'Me',
          admissionNumber: 'DEL123',
          admissionDate: new Date().toISOString(),
          dob: new Date('2015-01-01').toISOString(),
          gradeId: gradeId,
          academicYear: 2024,
        })
      const sId = createRes.body.data.id

      const res = await request(app)
        .delete(`${env.apiPrefix}/students/${sId}`)
        .set('Authorization', authHeader)

      if (res.statusCode !== 200) {
        console.log('Delete Student Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(200)

      // Verify deletion
      const listRes = await request(app)
        .get(`${env.apiPrefix}/students`)
        .query({ gradeId: gradeId })
        .set('Authorization', authHeader)

      const found = listRes.body.data.find((s) => s.id === sId)
      expect(found).toBeUndefined()
    })
  })

  describe('Attendance Routes', () => {
    beforeEach(async () => {
      // Setup Grade and Student
      const gradeRes = await request(app)
        .post(`${env.apiPrefix}/grades`)
        .set('Authorization', authHeader)
        .send({
          nameSi: 'Grade 4',
          nameEn: 'Grade 4',
          level: 4,
        })
      gradeId = gradeRes.body.data.id

      const studentRes = await request(app)
        .post(`${env.apiPrefix}/students`)
        .set('Authorization', authHeader)
        .send({
          firstNameEn: 'Attendance',
          lastNameEn: 'Student',
          admissionNumber: 'ATT123',
          admissionDate: new Date().toISOString(),
          dob: new Date('2015-01-01').toISOString(),
          gradeId: gradeId,
          academicYear: 2024,
        })
      studentId = studentRes.body.data.id
    })

    it('should mark attendance', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/attendance`)
        .set('Authorization', authHeader)
        .send({
          date: new Date().toISOString(),
          studentId: studentId,
          gradeId: gradeId,
          status: 'present',
        })

      if (res.statusCode !== 201) {
        console.log('Mark Attendance Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(201)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.status).toBe('present')
    })

    it('should list attendance by date', async () => {
      const date = new Date().toISOString()
      await request(app).post(`${env.apiPrefix}/attendance`).set('Authorization', authHeader).send({
        date: date,
        studentId: studentId,
        gradeId: gradeId,
        status: 'absent',
      })

      const res = await request(app)
        .get(`${env.apiPrefix}/attendance/by-date`)
        .query({ date: date, gradeId: gradeId })
        .set('Authorization', authHeader)

      if (res.statusCode !== 200) {
        console.log('List Attendance Failed:', res.statusCode, JSON.stringify(res.body, null, 2))
      }

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].status).toBe('absent')
    })
  })

  describe('House Routes', () => {
    it('should create, list, update, and delete houses', async () => {
      const houseId = await createHouse({ name: 'Lion', color: 'Red' })

      const listRes = await request(app).get(`${env.apiPrefix}/houses`).set('Authorization', authHeader)
      expect(listRes.statusCode).toBe(200)
      expect(listRes.body.data.find((h) => h.id === houseId)).toBeDefined()

      const updateRes = await request(app)
        .patch(`${env.apiPrefix}/houses/${houseId}`)
        .set('Authorization', authHeader)
        .send({ color: 'Maroon' })
      expect(updateRes.statusCode).toBe(200)
      expect(updateRes.body.data.color).toBe('Maroon')

      const deleteRes = await request(app)
        .delete(`${env.apiPrefix}/houses/${houseId}`)
        .set('Authorization', authHeader)
      expect(deleteRes.statusCode).toBe(200)
      expect(deleteRes.body.data).toEqual({ deleted: true })

      const afterDeleteList = await request(app).get(`${env.apiPrefix}/houses`).set('Authorization', authHeader)
      expect(afterDeleteList.body.data.find((h) => h.id === houseId)).toBeUndefined()
    })
  })

  describe('Squad Routes', () => {
    it('should create, list, update, and delete squads', async () => {
      const createRes = await request(app)
        .post(`${env.apiPrefix}/squads`)
        .set('Authorization', authHeader)
        .send({
          nameSi: 'Alpha Squad',
          nameEn: 'Alpha Squad',
          assignedGradeIds: [],
          assignedSectionIds: [],
        })
      expect(createRes.statusCode).toBe(201)
      const squadId = createRes.body.data.id

      const listRes = await request(app).get(`${env.apiPrefix}/squads`).set('Authorization', authHeader)
      expect(listRes.statusCode).toBe(200)
      expect(listRes.body.data.find((s) => s.id === squadId)).toBeDefined()

      const updateRes = await request(app)
        .patch(`${env.apiPrefix}/squads/${squadId}`)
        .set('Authorization', authHeader)
        .send({ nameEn: 'Updated Squad' })
      expect(updateRes.statusCode).toBe(200)
      expect(updateRes.body.data.nameEn).toBe('Updated Squad')

      const deleteRes = await request(app)
        .delete(`${env.apiPrefix}/squads/${squadId}`)
        .set('Authorization', authHeader)
      expect(deleteRes.statusCode).toBe(200)
      expect(deleteRes.body.data).toEqual({ deleted: true })

      const afterDeleteList = await request(app).get(`${env.apiPrefix}/squads`).set('Authorization', authHeader)
      expect(afterDeleteList.body.data.find((s) => s.id === squadId)).toBeUndefined()
    })
  })

  describe('Student House Assignments', () => {
    it('should assign and reassign students to houses', async () => {
      const gradeId = await createGrade(6)
      const houseAId = await createHouse({ name: 'Eagle', color: 'Blue' })
      const houseBId = await createHouse({ name: 'Hawk', color: 'Green' })
      const studentId = await createStudent({
        gradeId,
        firstNameEn: 'Alice',
        lastNameEn: 'House',
        admissionNumber: `H-${uniqueSuffix()}`,
      })

      const assignRes = await request(app)
        .post(`${env.apiPrefix}/student-house-assignments`)
        .set('Authorization', authHeader)
        .send({
          studentId,
          houseId: houseAId,
          gradeId,
          year: 2024,
          assignedDate: new Date().toISOString(),
        })
      expect(assignRes.statusCode).toBe(200)
      expect(assignRes.body.data.houseId).toBe(houseAId)

      const listRes = await request(app)
        .get(`${env.apiPrefix}/student-house-assignments`)
        .query({ houseId: houseAId, year: 2024 })
        .set('Authorization', authHeader)
      expect(listRes.statusCode).toBe(200)
      expect(listRes.body.data.length).toBe(1)
      expect(listRes.body.data[0].studentId).toBe(studentId)

      const reassignRes = await request(app)
        .post(`${env.apiPrefix}/student-house-assignments`)
        .set('Authorization', authHeader)
        .send({
          studentId,
          houseId: houseBId,
          gradeId,
          year: 2024,
        })
      expect(reassignRes.statusCode).toBe(200)
      expect(reassignRes.body.data.houseId).toBe(houseBId)

      const afterReassignList = await request(app)
        .get(`${env.apiPrefix}/student-house-assignments`)
        .query({ studentId, year: 2024 })
        .set('Authorization', authHeader)
      expect(afterReassignList.body.data.length).toBe(1)
      expect(afterReassignList.body.data[0].houseId).toBe(houseBId)
    })
  })

  describe('Competition Registrations', () => {
    let gradeId
    let houseId
    let studentId
    let competitionId
    const year = 2024

    beforeEach(async () => {
      gradeId = await createGrade(7)
      houseId = await createHouse({ name: 'Wolf', color: 'Silver' })
      studentId = await createStudent({
        gradeId,
        firstNameEn: 'Rick',
        lastNameEn: 'Runner',
        admissionNumber: `CR-${uniqueSuffix()}`,
      })
      const squadId = await createSquad('Track Squad')
      competitionId = await createCompetition({
        gradeId,
        squadId,
        year,
        name: 'Track Meet',
      })
    })

    it('registers a student in house mode and lists the entry', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          studentId,
          gradeId,
          houseId,
          mode: 'house',
          year,
        })
      expect(res.statusCode).toBe(201)
      expect(res.body.data.houseId).toBe(houseId)

      const listRes = await request(app)
        .get(`${env.apiPrefix}/competition-registrations`)
        .query({ competitionId, houseId })
        .set('Authorization', authHeader)
      expect(listRes.statusCode).toBe(200)
      expect(listRes.body.data.length).toBe(1)
      expect(listRes.body.data[0].studentId).toBe(studentId)
    })

    it('registers independent entries and rejects houseId in that mode', async () => {
      const goodRes = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          studentId,
          gradeId,
          mode: 'independent',
          year,
        })
      expect(goodRes.statusCode).toBe(201)
      expect(goodRes.body.data.houseId).toBeNull()

      const badRes = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          studentId: await createStudent({
            gradeId,
            firstNameEn: 'Indy',
            lastNameEn: 'House',
            admissionNumber: `CR-${uniqueSuffix()}`,
          }),
          gradeId,
          mode: 'independent',
          houseId,
          year,
        })
      expect(badRes.statusCode).toBe(400)
    })

    it('enforces house quotas per grade', async () => {
      const studentTwo = await createStudent({
        gradeId,
        firstNameEn: 'Runner',
        lastNameEn: 'Two',
        admissionNumber: `CR-${uniqueSuffix()}`,
      })
      const studentThree = await createStudent({
        gradeId,
        firstNameEn: 'Runner',
        lastNameEn: 'Three',
        admissionNumber: `CR-${uniqueSuffix()}`,
      })

      const first = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({ competitionId, studentId, gradeId, houseId, mode: 'house', year })
      const second = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({ competitionId, studentId: studentTwo, gradeId, houseId, mode: 'house', year })
      const third = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({ competitionId, studentId: studentThree, gradeId, houseId, mode: 'house', year })

      expect(first.statusCode).toBe(201)
      expect(second.statusCode).toBe(201)
      expect(third.statusCode).toBe(409)
    })

    it('deletes registrations', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/competition-registrations`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          studentId,
          gradeId,
          houseId,
          mode: 'house',
          year,
        })
      const registrationId = res.body.data.id

      const deleteRes = await request(app)
        .delete(`${env.apiPrefix}/competition-registrations/${registrationId}`)
        .set('Authorization', authHeader)
      expect(deleteRes.statusCode).toBe(200)

      const listRes = await request(app)
        .get(`${env.apiPrefix}/competition-registrations`)
        .query({ competitionId })
        .set('Authorization', authHeader)
      expect(listRes.body.data.length).toBe(0)
    })
  })

  describe('Competition Results & Points', () => {
    let gradeId
    let houseAId
    let houseBId
    let studentAId
    let studentBId
    let competitionId
    const year = 2024

    beforeEach(async () => {
      gradeId = await createGrade(8)
      houseAId = await createHouse({ name: 'Phoenix', color: 'Gold' })
      houseBId = await createHouse({ name: 'Dragon', color: 'Green' })
      studentAId = await createStudent({
        gradeId,
        firstNameEn: 'Pat',
        lastNameEn: 'First',
        admissionNumber: `RS-${uniqueSuffix()}`,
      })
      studentBId = await createStudent({
        gradeId,
        firstNameEn: 'Quinn',
        lastNameEn: 'Second',
        admissionNumber: `RS-${uniqueSuffix()}`,
      })
      const squadId = await createSquad('Result Squad')
      competitionId = await createCompetition({
        gradeId,
        squadId,
        year,
        name: 'Sports Day',
      })
    })

    it('records results, lists them, and computes house points', async () => {
      const recordRes = await request(app)
        .post(`${env.apiPrefix}/competition-results`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          year,
          results: [
            { place: 1, studentId: studentAId, houseId: houseAId, gradeId },
            { place: 2, studentId: studentBId, houseId: houseBId, gradeId },
          ],
        })
      expect(recordRes.statusCode).toBe(200)
      expect(recordRes.body.data.length).toBe(2)

      const listRes = await request(app)
        .get(`${env.apiPrefix}/competition-results`)
        .query({ competitionId })
        .set('Authorization', authHeader)
      expect(listRes.statusCode).toBe(200)
      expect(listRes.body.data.length).toBe(2)

      const pointsRes = await request(app)
        .get(`${env.apiPrefix}/competition-results/house-points`)
        .query({ year: String(year) })
        .set('Authorization', authHeader)
      expect(pointsRes.statusCode).toBe(200)
      const phoenixPoints = pointsRes.body.data.find((p) => p.houseId === houseAId)
      const dragonPoints = pointsRes.body.data.find((p) => p.houseId === houseBId)
      expect(phoenixPoints.points).toBe(15)
      expect(dragonPoints.points).toBe(10)
    })

    it('rejects duplicate places in the same result payload', async () => {
      const res = await request(app)
        .post(`${env.apiPrefix}/competition-results`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          year,
          results: [
            { place: 1, studentId: studentAId, houseId: houseAId, gradeId },
            { place: 1, studentId: studentBId, houseId: houseBId, gradeId },
          ],
        })
      expect(res.statusCode).toBe(400)
    })

    it('removes individual result entries', async () => {
      const recordRes = await request(app)
        .post(`${env.apiPrefix}/competition-results`)
        .set('Authorization', authHeader)
        .send({
          competitionId,
          year,
          results: [{ place: 1, studentId: studentAId, houseId: houseAId, gradeId }],
        })
      const resultId = recordRes.body.data[0].id

      const deleteRes = await request(app)
        .delete(`${env.apiPrefix}/competition-results/${resultId}`)
        .set('Authorization', authHeader)
      expect(deleteRes.statusCode).toBe(200)

      const listRes = await request(app)
        .get(`${env.apiPrefix}/competition-results`)
        .query({ competitionId })
        .set('Authorization', authHeader)
      expect(listRes.body.data.length).toBe(0)
    })
  })
})
