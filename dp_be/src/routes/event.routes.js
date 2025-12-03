const router = require('express').Router()
const ctrl = require('../controllers/event.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/event.validation')

/* Event CRUD */
router.post(
  '/',
  // permit([P.EVENT.CREATE]),
  validate(V.createEventSchema),
  ctrl.createEvent
)

router.get(
  '/',
  // permit([P.EVENT.READ]),
  ctrl.listEvents
)

router.patch(
  '/:id',
  // permit([P.EVENT.UPDATE]),
  validate(V.updateEventSchema),
  ctrl.updateEvent
)

router.delete(
  '/:id',
  // permit([P.EVENT.DELETE]),
  validate(V.deleteEventSchema),
  ctrl.deleteEvent
)

/* Event Registration */
router.post(
  '/register',
  // permit([P.EVENT.REGISTER]),
  validate(V.registerStudentForEventSchema),
  ctrl.registerStudentForEvent
)

router.get(
  '/registrations',
  // permit([P.EVENT.READ]),
  validate(V.listEventRegistrationsSchema),
  ctrl.listEventRegistrations
)

module.exports = router
