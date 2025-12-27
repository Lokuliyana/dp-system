const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../../src/app')
const setup = require('../setup')
const env = require('../../src/config/env')
const ParentStudentLink = require('../../src/models/parentStudentLink.model')

const schoolId = new mongoose.Types.ObjectId().toString()
const mockUser = {
  id: new mongoose.Types.ObjectId().toString(),
  role: 'super_admin',
  permissions: ['*'],
  schoolId,
}

const token = jwt.sign(mockUser, env.jwtAccessSecret, { expiresIn: '1h' })
const authHeader = `Bearer ${token}`

let counter = 0
const unique = (prefix) => `${prefix}-${Date.now()}-${++counter}`

const createGrade = async (label) => {
  const res = await request(app)
    .post(`${env.apiPrefix}/grades`)
    .set('Authorization', authHeader)
    .send({
      nameSi: label,
      nameEn: label,
      level: Math.max(1, Math.min(14, (counter % 14) + 1)),
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createStudent = async (gradeId, overrides = {}) => {
  const res = await request(app)
    .post(`${env.apiPrefix}/students`)
    .set('Authorization', authHeader)
    .send({
      firstNameEn: 'Test',
      lastNameEn: unique('Student'),
      firstNameSi: 'ශිෂ්‍ය',
      lastNameSi: 'නම',
      fullNameSi: 'සම්පූර්ණ නම',
      nameWithInitialsSi: 'අ. නම',
      fullNameEn: `Test ${unique('Student')}`,
      sex: 'male',
      admissionNumber: unique('ADM'),
      admissionDate: new Date().toISOString(),
      dob: new Date('2010-01-01').toISOString(),
      gradeId,
      academicYear: 2024,
      ...overrides,
    })

  expect(res.statusCode).toBe(201)
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

describe('Staff roles and teachers', () => {
  let gradeId

  beforeEach(async () => {
    gradeId = await createGrade(unique('Grade'))
  })

  it('manages staff roles with responsibilities and teachers', async () => {
    const createRoleRes = await request(app)
      .post(`${env.apiPrefix}/staff-roles`)
      .set('Authorization', authHeader)
      .send({
        nameSi: 'Panthi Gurubhara',
        nameEn: 'Class Teacher',
        gradeBased: true,
        singleGraded: true,
        gradesEffected: [gradeId],
        responsibilities: [
          { level: 1, textSi: 'Panthi Katayuthu', textEn: 'Lead the grade' },
          { level: 2, textSi: 'Anubala', textEn: 'Support programmes' },
        ],
        descriptionEn: 'Handles grade responsibilities',
        order: 2,
      })

    expect(createRoleRes.statusCode).toBe(201)
    expect(createRoleRes.body.data.responsibilities).toHaveLength(2)
    expect(createRoleRes.body.data.gradeBased).toBe(true)
    const staffRoleId = createRoleRes.body.data.id

    const listRoleRes = await request(app)
      .get(`${env.apiPrefix}/staff-roles`)
      .set('Authorization', authHeader)

    expect(listRoleRes.statusCode).toBe(200)
    expect(listRoleRes.body.data.find((r) => r.id === staffRoleId)).toBeTruthy()

    const updateRoleRes = await request(app)
      .patch(`${env.apiPrefix}/staff-roles/${staffRoleId}`)
      .set('Authorization', authHeader)
      .send({
        responsibilities: [{ level: 1, textSi: 'Adhyayana', textEn: 'Lead academics' }],
        order: 1,
        descriptionSi: 'Aluth',
      })

    expect(updateRoleRes.statusCode).toBe(200)
    expect(updateRoleRes.body.data.responsibilities).toHaveLength(1)
    expect(updateRoleRes.body.data.order).toBe(1)
    expect(updateRoleRes.body.data.descriptionSi).toBe('Aluth')

    const teacherRes = await request(app)
      .post(`${env.apiPrefix}/teachers`)
      .set('Authorization', authHeader)
      .send({
        firstNameEn: 'Alice',
        lastNameEn: 'Perera',
        email: `${unique('alice')}@school.test`,
        phone: '0700000000',
        dateJoined: new Date().toISOString(),
        roleIds: [staffRoleId],
        qualifications: ['B.Ed'],
        status: 'active',
      })

    expect(teacherRes.statusCode).toBe(201)
    const teacherId = teacherRes.body.data.id
    expect(teacherRes.body.data.roleIds).toContain(staffRoleId)

    const listTeacherRes = await request(app)
      .get(`${env.apiPrefix}/teachers`)
      .query({ roleId: staffRoleId })
      .set('Authorization', authHeader)

    expect(listTeacherRes.statusCode).toBe(200)
    expect(listTeacherRes.body.data.find((t) => t.id === teacherId)).toBeTruthy()

    const pastRoleRes = await request(app)
      .post(`${env.apiPrefix}/teachers/${teacherId}/past-roles`)
      .set('Authorization', authHeader)
      .send({
        roleId: staffRoleId,
        fromYear: 2020,
        toYear: 2022,
      })

    expect(pastRoleRes.statusCode).toBe(200)
    expect(pastRoleRes.body.data.pastRoles).toHaveLength(1)

    const updateTeacherRes = await request(app)
      .patch(`${env.apiPrefix}/teachers/${teacherId}`)
      .set('Authorization', authHeader)
      .send({ status: 'inactive' })

    expect(updateTeacherRes.statusCode).toBe(200)
    expect(updateTeacherRes.body.data.status).toBe('inactive')

    const deleteRoleRes = await request(app)
      .delete(`${env.apiPrefix}/staff-roles/${staffRoleId}`)
      .set('Authorization', authHeader)

    expect(deleteRoleRes.statusCode).toBe(200)
    const postDeleteList = await request(app)
      .get(`${env.apiPrefix}/staff-roles`)
      .set('Authorization', authHeader)

    expect(postDeleteList.body.data.find((r) => r.id === staffRoleId)).toBeUndefined()
  })
})

describe('Prefect positions and appointments', () => {
  let gradeId
  let studentId
  let positionId
  let prefectYearId

  beforeEach(async () => {
    gradeId = await createGrade(unique('Prefect-Grade'))
    studentId = await createStudent(gradeId, { academicYear: 2024 })

    const positionRes = await request(app)
      .post(`${env.apiPrefix}/prefect-positions`)
      .set('Authorization', authHeader)
      .send({
        nameSi: 'Pradhana',
        nameEn: 'Head Prefect',
        responsibilitySi: 'Leadership',
        responsibilityEn: 'Leadership',
        rankLevel: 1,
      })
    expect(positionRes.statusCode).toBe(201)
    positionId = positionRes.body.data.id

    const yearRes = await request(app)
      .post(`${env.apiPrefix}/prefects`)
      .set('Authorization', authHeader)
      .send({
        year: 2024,
        appointedDate: new Date().toISOString(),
      })
    expect(yearRes.statusCode).toBe(201)
    prefectYearId = yearRes.body.data.id
  })

  it('manages prefect appointments and updates', async () => {
    const addRes = await request(app)
      .post(`${env.apiPrefix}/prefects/${prefectYearId}/students`)
      .set('Authorization', authHeader)
      .send({
        studentId,
        studentNameEn: 'Sam Prefect',
        studentNameSi: 'Saam',
        rank: 'prefect',
        positionIds: [positionId],
      })

    expect(addRes.statusCode).toBe(200)
    expect(addRes.body.data.students).toHaveLength(1)
    expect(addRes.body.data.students[0].rank).toBe('prefect')

    const updateRes = await request(app)
      .patch(`${env.apiPrefix}/prefects/${prefectYearId}/students/${studentId}`)
      .set('Authorization', authHeader)
      .send({
        rank: 'vice-prefect',
        positionIds: [positionId],
      })

    expect(updateRes.statusCode).toBe(200)
    expect(updateRes.body.data.students[0].rank).toBe('vice-prefect')

    const listRes = await request(app)
      .get(`${env.apiPrefix}/prefects`)
      .query({ year: '2024' })
      .set('Authorization', authHeader)

    expect(listRes.statusCode).toBe(200)
    expect(listRes.body.data[0].students).toHaveLength(1)

    const removeRes = await request(app)
      .delete(`${env.apiPrefix}/prefects/${prefectYearId}/students/${studentId}`)
      .set('Authorization', authHeader)

    expect(removeRes.statusCode).toBe(200)
    expect(removeRes.body.data.students).toHaveLength(0)
  })
})

describe('Parents and parent-student links', () => {
  let gradeId
  let studentId

  beforeEach(async () => {
    gradeId = await createGrade(unique('Parent-Grade'))
    studentId = await createStudent(gradeId, { academicYear: 2024 })
  })

  it('manages parents CRUD and enforces single primary link per student', async () => {
    const parentOneRes = await request(app)
      .post(`${env.apiPrefix}/parents`)
      .set('Authorization', authHeader)
      .send({
        firstNameEn: 'Parent',
        lastNameEn: unique('One'),
        occupationEn: 'Teacher',
        phoneNum: '0711000000',
      })
    expect(parentOneRes.statusCode).toBe(201)
    const parentOneId = parentOneRes.body.data.id

    const parentTwoRes = await request(app)
      .post(`${env.apiPrefix}/parents`)
      .set('Authorization', authHeader)
      .send({
        firstNameEn: 'Parent',
        lastNameEn: unique('Two'),
        occupationEn: 'Engineer',
        phoneNum: '0712000000',
      })
    expect(parentTwoRes.statusCode).toBe(201)
    const parentTwoId = parentTwoRes.body.data.id

    const listParentsRes = await request(app)
      .get(`${env.apiPrefix}/parents`)
      .query({ q: 'Parent' })
      .set('Authorization', authHeader)

    expect(listParentsRes.statusCode).toBe(200)
    expect(listParentsRes.body.data.length).toBeGreaterThanOrEqual(2)

    const updateParentRes = await request(app)
      .patch(`${env.apiPrefix}/parents/${parentOneId}`)
      .set('Authorization', authHeader)
      .send({ occupationEn: 'Doctor' })

    expect(updateParentRes.statusCode).toBe(200)
    expect(updateParentRes.body.data.occupationEn).toBe('Doctor')

    const linkOneRes = await request(app)
      .post(`${env.apiPrefix}/parent-student-links`)
      .set('Authorization', authHeader)
      .send({
        parentId: parentOneId,
        studentId,
        relationshipEn: 'Mother',
        isPrimary: true,
      })

    expect(linkOneRes.statusCode).toBe(201)

    const linkTwoRes = await request(app)
      .post(`${env.apiPrefix}/parent-student-links`)
      .set('Authorization', authHeader)
      .send({
        parentId: parentTwoId,
        studentId,
        relationshipEn: 'Father',
        isPrimary: true,
      })

    expect(linkTwoRes.statusCode).toBe(201)

    let links = await ParentStudentLink.find({ studentId, schoolId }).lean()
    expect(links).toHaveLength(2)

    let linkOneDoc = links.find((l) => String(l.parentId) === parentOneId)
    let linkTwoDoc = links.find((l) => String(l.parentId) === parentTwoId)
    expect(linkTwoDoc.isPrimary).toBe(true)
    expect(linkOneDoc.isPrimary).toBe(false)

    const updateLinkRes = await request(app)
      .patch(`${env.apiPrefix}/parent-student-links/${linkOneRes.body.data.id}`)
      .set('Authorization', authHeader)
      .send({ isPrimary: true, relationshipEn: 'Guardian' })

    expect(updateLinkRes.statusCode).toBe(200)

    links = await ParentStudentLink.find({ studentId, schoolId }).lean()
    linkOneDoc = links.find((l) => String(l.parentId) === parentOneId)
    linkTwoDoc = links.find((l) => String(l.parentId) === parentTwoId)
    expect(linkOneDoc.isPrimary).toBe(true)
    expect(linkOneDoc.relationshipEn).toBe('Guardian')
    expect(linkTwoDoc.isPrimary).toBe(false)

    const deleteLinkRes = await request(app)
      .delete(`${env.apiPrefix}/parent-student-links/${linkTwoRes.body.data.id}`)
      .set('Authorization', authHeader)

    expect(deleteLinkRes.statusCode).toBe(200)
    links = await ParentStudentLink.find({ studentId, schoolId }).lean()
    expect(links).toHaveLength(1)
  })
})
