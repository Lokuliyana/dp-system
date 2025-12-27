const bcrypt = require('bcryptjs')
const School = require('../models/school.model')
const Role = require('../models/role.model')
const AppUser = require('../models/appUser.model')

async function seedAdmin() {
  try {
    console.log('Starting Admin Seeder...')

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

    console.log('Admin Seeder Completed Successfully')
  } catch (err) {
    console.error('Admin Seeder Failed:', err)
    // We don't throw here to avoid crashing the server startup, 
    // but we log the error.
  }
}

module.exports = seedAdmin
