require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Import models
const School = require('../src/models/school.model')
const Role = require('../src/models/role.model')
const AppUser = require('../src/models/appUser.model')

async function run() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    })

    console.log('Connected.')

    /* ---------------------- 1. CREATE SCHOOL ---------------------- */
    const schoolNameEn = 'Niwanthidiya Sri Ananda Dhamma School'
    const schoolNameSi = 'නිවන්තිඩිය ශ්‍රී ආනන්ද දහම් පාසල'

    let school = await School.findOne({ nameEn: schoolNameEn }).lean()

    if (!school) {
      school = await School.create({
        nameEn: schoolNameEn,
        nameSi: schoolNameSi,
        addressEn: '',
        addressSi: '',
      })

      console.log('Created School:', school._id)
    } else {
      console.log('School already exists:', school._id)
    }

    /* ---------------------- 2. CREATE ROLE ------------------------ */
    const roleName = 'super_admin'

    let role = await Role.findOne({ name: roleName }).lean()

    if (!role) {
      role = await Role.create({
        name: roleName,
        description: 'System Super Administrator',
        permissions: ['*'], // full access
        schoolId: school._id,
      })

      console.log('Created Role:', role._id)
    } else {
      console.log('Role already exists:', role._id)
    }

    /* ---------------------- 3. CREATE ADMIN USER ------------------ */
    const adminEmail = 'admin@gmail.com'
    const adminPassword = 'admin123'

    let admin = await AppUser.findOne({
      email: adminEmail.toLowerCase(),
      schoolId: school._id,
    }).lean()

    if (!admin) {
      const hashed = await bcrypt.hash(adminPassword, 10)

      admin = await AppUser.create({
        name: 'admin',
        email: adminEmail.toLowerCase(),
        password: hashed,
        roleId: role._id,
        schoolId: school._id,
        isActive: true,
      })

      console.log('Created Admin User:', admin._id)
    } else {
      console.log('Admin user already exists:', admin._id)
    }

    console.log('\n✔ SEEDING COMPLETED SUCCESSFULLY')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
