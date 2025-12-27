const mongoose = require('mongoose')
const env = require('./env')

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

module.exports = async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      dbName: env.mongoDbName,
      maxPoolSize: env.mongoPoolSize,
      bufferCommands: false, // Disable mongoose buffering
    }

    mongoose.set('strictQuery', true)
    
    const maskedUri = env.mongoUri.replace(/:([^:@]+)@/, ':****@')
    console.log(`Connecting to MongoDB: ${maskedUri}`)

    cached.promise = mongoose.connect(env.mongoUri, opts).then((mongoose) => {
      console.log('MongoDB connected')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
