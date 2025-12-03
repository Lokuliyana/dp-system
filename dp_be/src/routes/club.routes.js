const router = require('express').Router()
const ctrl = require('../controllers/club.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/club.validation')

router.post(
  '/',
  // permit([P.CLUB.CREATE]),
  validate(V.createClubSchema),
  ctrl.createClub
)

router.get(
  '/',
  // permit([P.CLUB.READ]),
  ctrl.listClubs
)

router.patch(
  '/:id',
  // permit([P.CLUB.UPDATE]),
  validate(V.updateClubSchema),
  ctrl.updateClub
)

router.delete(
  '/:id',
  // permit([P.CLUB.DELETE]),
  validate(V.deleteClubSchema),
  ctrl.deleteClub
)

router.post(
  '/:id/assign',
  // permit([P.CLUB.UPDATE]),
  validate(V.assignPositionSchema),
  ctrl.assignPosition
)

module.exports = router
