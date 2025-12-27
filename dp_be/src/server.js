const app = require('./app')
const env = require('./config/env')
const connectDB = require('./config/db')
const seedAdmin = require('./utils/adminSeeder')

;(async () => {
  await connectDB()
  await seedAdmin()
  app.listen(env.port, () => {
    console.log(`${env.appName} running on port ${env.port}`)
  })
})()
