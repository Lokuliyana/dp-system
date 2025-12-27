const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../../src/app')
const setup = require('../setup')
const env = require('../../src/config/env')

const schoolId = new mongoose.Types.ObjectId().toString()
const mockUser = {
  id: new mongoose.Types.ObjectId().toString(),
  role: 'super_admin',
  permissions: ['*'],
  schoolId,
}

const token = jwt.sign(mockUser, env.jwtAccessSecret, { expiresIn: '1h' })
const authHeader = `Bearer ${token}`

let uniqueCounter = 0
const unique = (prefix) => `${prefix}-${Date.now()}-${++uniqueCounter}`

const createTeacher = async (firstName = 'Teacher') => {
  const res = await request(app)
    .post(`${env.apiPrefix}/teachers`)
    .set('Authorization', authHeader)
    .send({
      firstNameEn: firstName,
      lastNameEn: unique('User'),
      email: `${unique('teacher')}@school.test`,
      phone: '0710000000',
      dateJoined: new Date().toISOString(),
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createGrade = async (label = 'Grade') => {
  const res = await request(app)
    .post(`${env.apiPrefix}/grades`)
    .set('Authorization', authHeader)
    .send({
      nameSi: label,
      nameEn: label,
      level: Math.max(1, (uniqueCounter % 14) + 1),
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createStudent = async (gradeId, overrides = {}) => {
  const res = await request(app)
    .post(`${env.apiPrefix}/students`)
    .set('Authorization', authHeader)
    .send({
      firstNameEn: 'Stu',
      lastNameEn: unique('Dent'),
      firstNameSi: 'ශිෂ්‍ය',
      lastNameSi: 'නම',
      fullNameSi: 'සම්පූර්ණ නම',
      nameWithInitialsSi: 'අ. නම',
      fullNameEn: `Stu ${unique('Dent')}`,
      sex: 'male',
      admissionNumber: unique('ADM'),
      admissionDate: new Date().toISOString(),
      dob: new Date('2012-01-01').toISOString(),
      gradeId,
      academicYear: 2024,
      ...overrides,
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createHouse = async (name = 'House') => {
  const res = await request(app)
    .post(`${env.apiPrefix}/houses`)
    .set('Authorization', authHeader)
    .send({
      nameSi: unique(name),
      nameEn: unique(name),
      color: 'Blue',
      mottoEn: 'Aim High',
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createSquad = async (name = 'Squad') => {
  const res = await request(app)
    .post(`${env.apiPrefix}/squads`)
    .set('Authorization', authHeader)
    .send({
      nameSi: unique(name),
      nameEn: unique(name),
      assignedGradeIds: [],
      assignedSectionIds: [],
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createCompetition = async ({ gradeId, squadId, year, isMainCompetition = true }) => {
  const label = unique('Competition')
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
      isMainCompetition,
    })

  expect(res.statusCode).toBe(201)
  return res.body.data.id
}

const createClubPosition = async (name = 'President') => {
  const res = await request(app)
    .post(`${env.apiPrefix}/club-positions`)
    .set('Authorization', authHeader)
    .send({
      nameSi: unique(name),
      nameEn: unique(name),
      responsibilityEn: 'Lead',
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

describe('Team selection zonal/district/allisland pipeline', () => {
  it('builds zonal suggestions from results and auto-generates next levels', async () => {
    const year = 2031
    const gradeId = await createGrade('Zonal Grade')
    const squadId = await createSquad('Zonal Squad')
    const competitionId = await createCompetition({ gradeId, squadId, year })
    const studentOne = await createStudent(gradeId)
    const studentTwo = await createStudent(gradeId)

    const resultsRes = await request(app)
      .post(`${env.apiPrefix}/competition-results`)
      .set('Authorization', authHeader)
      .send({
        competitionId,
        year,
        results: [
          { place: 1, studentId: studentOne, gradeId },
          { place: 2, studentId: studentTwo, gradeId },
        ],
      })
    expect(resultsRes.statusCode).toBe(200)

    const suggestionsRes = await request(app)
      .get(`${env.apiPrefix}/team-selections/zonal-suggestions`)
      .query({ year: String(year) })
      .set('Authorization', authHeader)

    expect(suggestionsRes.statusCode).toBe(200)
    expect(suggestionsRes.body.data).toHaveLength(2)
    expect(suggestionsRes.body.data[0].studentId._id).toBe(studentOne)

    const saveZonalRes = await request(app)
      .post(`${env.apiPrefix}/team-selections`)
      .set('Authorization', authHeader)
      .send({
        level: 'zonal',
        year,
        entries: suggestionsRes.body.data.map(e => ({
          ...e,
          studentId: e.studentId._id
        })),
      })
    expect(saveZonalRes.statusCode).toBe(200)
    expect(saveZonalRes.body.data.totalMarks).toBe(9)

    const autoDistrictRes = await request(app)
      .post(`${env.apiPrefix}/team-selections/auto-generate`)
      .set('Authorization', authHeader)
      .send({
        fromLevel: 'zonal',
        toLevel: 'district',
        year,
      })
    expect(autoDistrictRes.statusCode).toBe(200)
    expect(autoDistrictRes.body.data.level).toBe('district')
    expect(autoDistrictRes.body.data.entries).toHaveLength(1)
    expect(autoDistrictRes.body.data.entries[0].place).toBeUndefined()

    const saveDistrictRes = await request(app)
      .post(`${env.apiPrefix}/team-selections`)
      .set('Authorization', authHeader)
      .send({
        level: 'district',
        year,
        entries: [{ competitionId, studentId: studentOne, place: 1 }],
      })
    expect(saveDistrictRes.statusCode).toBe(200)
    expect(saveDistrictRes.body.data.totalMarks).toBe(5)

    const recomputeRes = await request(app)
      .post(`${env.apiPrefix}/team-selections/compute-total`)
      .set('Authorization', authHeader)
      .send({
        level: 'district',
        year,
      })
    expect(recomputeRes.statusCode).toBe(200)
    expect(recomputeRes.body.data.totalMarks).toBe(5)

    const autoIslandRes = await request(app)
      .post(`${env.apiPrefix}/team-selections/auto-generate`)
      .set('Authorization', authHeader)
      .send({
        fromLevel: 'district',
        toLevel: 'allisland',
        year,
      })
    expect(autoIslandRes.statusCode).toBe(200)
    expect(autoIslandRes.body.data.level).toBe('allisland')
    expect(autoIslandRes.body.data.entries).toHaveLength(1)
  })

  it('suggests zonal entries from registrations when results are not available', async () => {
    const year = 2032
    const gradeId = await createGrade('Reg Grade')
    const squadId = await createSquad('Reg Squad')
    const competitionId = await createCompetition({ gradeId, squadId, year })
    const studentId = await createStudent(gradeId)

    const regRes = await request(app)
      .post(`${env.apiPrefix}/competition-registrations`)
      .set('Authorization', authHeader)
      .send({
        competitionId,
        studentId,
        gradeId,
        mode: 'independent',
        year,
      })
    expect(regRes.statusCode).toBe(201)

    const suggestionsRes = await request(app)
      .get(`${env.apiPrefix}/team-selections/zonal-suggestions`)
      .query({ year: String(year) })
      .set('Authorization', authHeader)

    expect(suggestionsRes.statusCode).toBe(200)
    expect(suggestionsRes.body.data).toHaveLength(1)
    expect(suggestionsRes.body.data[0].studentId._id).toBe(studentId)
    expect(suggestionsRes.body.data[0].competitionId).toBe(competitionId)
  })
})

describe('Events and clubs with MIC teachers', () => {
  it('manages events CRUD, registrations, and club memberships', async () => {
    const teacherMicId = await createTeacher('EventMic')
    const teacherClubId = await createTeacher('ClubMic')
    const gradeId = await createGrade('Event Grade')
    const studentId = await createStudent(gradeId)
    const eventYear = 2025

    const createEventRes = await request(app)
      .post(`${env.apiPrefix}/events`)
      .set('Authorization', authHeader)
      .send({
        nameSi: unique('Event'),
        nameEn: unique('Event'),
        descriptionEn: 'Inter-house sports meet',
        eventType: 'sports',
        date: new Date('2025-02-01').toISOString(),
        gradeIds: [gradeId],
        teacherInChargeId: teacherMicId,
        year: eventYear,
      })
    expect(createEventRes.statusCode).toBe(201)
    const eventId = createEventRes.body.data.id

    const updateEventRes = await request(app)
      .patch(`${env.apiPrefix}/events/${eventId}`)
      .set('Authorization', authHeader)
      .send({
        descriptionEn: 'Updated sports meet',
        eventType: 'athletics',
      })
    expect(updateEventRes.statusCode).toBe(200)
    expect(updateEventRes.body.data.descriptionEn).toBe('Updated sports meet')

    const listEventsRes = await request(app)
      .get(`${env.apiPrefix}/events`)
      .query({ year: String(eventYear) })
      .set('Authorization', authHeader)
    expect(listEventsRes.statusCode).toBe(200)
    const listedEvent = listEventsRes.body.data.find(
      (e) => e.id === eventId || e._id === eventId
    )
    expect(listedEvent).toBeTruthy()

    const eventRegRes = await request(app)
      .post(`${env.apiPrefix}/events/register`)
      .set('Authorization', authHeader)
      .send({
        eventId,
        studentId,
        year: eventYear,
      })
    expect(eventRegRes.statusCode).toBe(200)

    const listRegRes = await request(app)
      .get(`${env.apiPrefix}/events/registrations`)
      .query({ eventId, year: String(eventYear) })
      .set('Authorization', authHeader)
    expect(listRegRes.statusCode).toBe(200)
    expect(listRegRes.body.data.length).toBe(1)
    expect(listRegRes.body.data[0].studentId).toBe(studentId)

    const clubPositionId = await createClubPosition('President')
    const createClubRes = await request(app)
      .post(`${env.apiPrefix}/clubs`)
      .set('Authorization', authHeader)
      .send({
        nameSi: unique('Club'),
        nameEn: unique('Club'),
        descriptionEn: 'Science Club',
        teacherInChargeId: teacherClubId,
        year: 2025,
      })
    expect(createClubRes.statusCode).toBe(201)
    const clubId = createClubRes.body.data.id

    const assignRes = await request(app)
      .post(`${env.apiPrefix}/clubs/${clubId}/assign`)
      .set('Authorization', authHeader)
      .send({
        studentId,
        positionId: clubPositionId,
      })
    expect(assignRes.statusCode).toBe(200)
    expect(assignRes.body.data.members[0].studentId).toBe(studentId)
    expect(assignRes.body.data.members[0].positionId).toBe(clubPositionId)

    const updateClubRes = await request(app)
      .patch(`${env.apiPrefix}/clubs/${clubId}`)
      .set('Authorization', authHeader)
      .send({
        descriptionEn: 'Updated Science Club',
        teacherInChargeId: teacherMicId,
      })
    expect(updateClubRes.statusCode).toBe(200)
    expect(updateClubRes.body.data.teacherInChargeId).toBe(teacherMicId)

    const listClubsRes = await request(app)
      .get(`${env.apiPrefix}/clubs`)
      .query({ year: '2025' })
      .set('Authorization', authHeader)
    expect(listClubsRes.statusCode).toBe(200)
    const listedClub = listClubsRes.body.data.find(
      (c) => c.id === clubId || c._id === clubId
    )
    expect(listedClub).toBeTruthy()

    const deleteClubRes = await request(app)
      .delete(`${env.apiPrefix}/clubs/${clubId}`)
      .set('Authorization', authHeader)
    expect(deleteClubRes.statusCode).toBe(200)
  })
})

describe('Teacher house assignments', () => {
  it('assigns teachers to houses and lists assignments', async () => {
    const teacherId = await createTeacher('HouseMic')
    const houseId = await createHouse('Lion')

    const assignRes = await request(app)
      .post(`${env.apiPrefix}/teacher-house-assignments`)
      .set('Authorization', authHeader)
      .send({
        teacherId,
        houseId,
        assignedDate: new Date('2025-01-01').toISOString(),
      })

    expect(assignRes.statusCode).toBe(200)
    expect(assignRes.body.data.teacherId).toBe(teacherId)
    expect(assignRes.body.data.houseId).toBe(houseId)

    const listRes = await request(app)
      .get(`${env.apiPrefix}/teacher-house-assignments`)
      .query({ teacherId })
      .set('Authorization', authHeader)

    expect(listRes.statusCode).toBe(200)
    expect(listRes.body.data.length).toBe(1)
    expect(listRes.body.data[0].houseId).toBe(houseId)
  })
})
