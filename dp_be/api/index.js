const app = require('../src/app')
const connectDB = require('../src/config/db')

module.exports = async (req, res) => {
  try {
    await connectDB()
  } catch (error) {
    console.error('Database connection failed', error)
    return res.status(500).json({ error: 'Database connection failed' })
  }

  app(req, res)
}
