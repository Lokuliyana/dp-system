const app = require('./app')
const env = require('./config/env')
const connectDB = require('./config/db')

;(async () => {
  await connectDB()
  app.listen(env.port, () => {
    console.log(`${env.appName} running on port ${env.port}`)
  })
})()
