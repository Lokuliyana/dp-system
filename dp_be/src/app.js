const express = require('express')
const cors = require('./config/cors')
const rateLimit = require('./config/rateLimit')
const env = require('./config/env')

const appUsersRoutes = require('./routes/system/appUser.routes')
const routes = require('./routes')
const notFound = require('./middlewares/notFound.middleware')
const errorHandler = require('./middlewares/error.middleware')

const auth = require('./middlewares/auth.middleware')
const injectTenant = require('./middlewares/tenant.middleware')

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./docs/swagger')

const app = express()

// Trust the first proxy (Vercel/Heroku/etc)
app.set('trust proxy', 1)

const morgan = require('morgan')
app.use(morgan('dev'))

app.use(cors) // 2nd
app.use(express.json({ limit: '1mb' })) // 3rd
app.use(rateLimit) // 4th

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/health', (_req, res) =>
  res.json({ ok: true, name: env.appName })
)

app.use(`${env.apiPrefix}/app-users`, appUsersRoutes)

app.use(auth)
app.use(injectTenant)

app.use(env.apiPrefix, routes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
