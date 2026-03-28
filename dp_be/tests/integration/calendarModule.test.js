const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const env = require('../../src/config/env');
const setup = require('../setup');
const OrganizationCalendar = require('../../src/models/system/organization-calendar.model');
const Event = require('../../src/models/activities/event.model');
const Exam = require('../../src/models/student/exam.model');
const AppUser = require('../../src/models/system/appUser.model');

describe('Organization Calendar API', () => {
    jest.setTimeout(30000);
    let schoolId;
    let userId;
    let authHeader;

    beforeAll(async () => {
        await setup.connect();
    });

    afterAll(async () => {
        await setup.close();
    });

    beforeEach(async () => {
        await setup.clear();
        schoolId = new mongoose.Types.ObjectId();
        userId = new mongoose.Types.ObjectId();
        
        // Create user in DB for auth middleware
        await AppUser.create({
            _id: userId,
            name: 'Test Admin',
            email: `admin-${userId}@test.com`,
            password: 'password123',
            role: 'super_admin',
            permissions: ['*'],
            schoolId,
            isActive: true
        });

        const token = jwt.sign({ 
            id: userId.toString(), 
            role: 'super_admin', 
            permissions: ['*'], 
            schoolId 
        }, env.jwtAccessSecret, { expiresIn: '1h' });
        authHeader = `Bearer ${token}`;
    });

    describe('GET /api/v1/organization-calendar', () => {
        it('should return unified events from multiple sources', async () => {
        });
    });

    describe('POST /api/v1/organization-calendar', () => {
        it('should upsert day config without business hours', async () => {
            const date = new Date('2025-06-10');
            date.setHours(0, 0, 0, 0);

            const payload = {
                date: date.toISOString(),
                type: 'PublicHoliday',
                label: 'New Year'
            };

            const res = await request(app)
                .post('/api/v1/organization-calendar')
                .set('Authorization', authHeader)
                .send(payload);

            if (res.statusCode !== 200) {
                console.error('POST Failed:', res.statusCode, JSON.stringify(res.body, null, 2));
            }
            expect(res.statusCode).toBe(200);

            expect(res.body.data.type).toBe('PublicHoliday');
            expect(res.body.data.label).toBe('New Year');
            expect(res.body.data.isWorking).toBeUndefined();
            expect(res.body.data.startTime).toBeUndefined();

            const saved = await OrganizationCalendar.findOne({ date });
            expect(saved.type).toBe('PublicHoliday');
        });
    });
});
