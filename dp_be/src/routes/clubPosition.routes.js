const router = require('express').Router()
const ctrl = require('../controllers/clubPosition.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/clubPosition.validation')

router.post(
  '/',
  // permit([P.CLUB_POSITION.CREATE]),
  validate(V.createClubPositionSchema),
  ctrl.createClubPosition
)

router.get(
  '/',
  // permit([P.CLUB_POSITION.READ]),
  ctrl.listClubPositions
)

router.patch(
  '/:id',
  // permit([P.CLUB_POSITION.UPDATE]),
  validate(V.updateClubPositionSchema),
  ctrl.updateClubPosition
)

router.delete(
  '/:id',
  // permit([P.CLUB_POSITION.DELETE]),
  validate(V.deleteClubPositionSchema),
  ctrl.deleteClubPosition
)

module.exports = router
