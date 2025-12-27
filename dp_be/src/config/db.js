const mongoose = require('mongoose')
const env = require('./env')

module.exports = async function connectDB() {
  mongoose.set('strictQuery', true)
  
  const maskedUri = env.mongoUri.replace(/:([^:@]+)@/, ':****@')
  console.log(`Connecting to MongoDB: ${maskedUri}`)

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    maxPoolSize: env.mongoPoolSize
  })
  console.log('MongoDB connected')
}
