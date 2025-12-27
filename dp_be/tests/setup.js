const mongoose = require('mongoose')

const env = require('../src/config/env')



const connect = async () => {
  // Use existing connection if available (e.g. from app start)
  if (mongoose.connection.readyState !== 0) {
    return
  }

  // For integration tests, we might want to use a real DB or an in-memory one.
  // Given the environment, let's try to use the configured MONGO_URI if available,
  // or fall back to a memory server if we want isolation.
  // However, the user asked to "run backend test", implying integration with the current setup.
  // But usually integration tests should not pollute the main DB.
  // Let's check if we can use a separate test DB.

  // For safety and isolation, let's use a separate test database name if using the real URI,
  // or just use the real URI if it's already a dev/test environment.
  // Since I don't want to break anything, I'll try to use the env.mongoUri but with a different DB name if possible,
  // or just rely on the fact that we are in a dev environment.

  // Actually, looking at the plan, I didn't specify MongoMemoryServer.
  // Let's stick to the project's pattern. The project uses `src/config/db.js`.
  // But for tests we often want to start/stop connection.

  // Let's use the standard mongoose connect.

  try {
    await mongoose.connect(env.mongoUri, {
      dbName: 'school_system_test', // Use a specific test DB
      maxPoolSize: 10
    })
    console.log('Test MongoDB connected')
  } catch (err) {
    console.error('Test MongoDB connection error:', err)
    process.exit(1)
  }
}

const close = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
}

const clear = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

module.exports = { connect, close, clear }
