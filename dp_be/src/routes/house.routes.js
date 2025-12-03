const router = require('express').Router()
const ctrl = require('../controllers/house.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/house.validation')

router.post(
  '/',
  // permit([P.HOUSE.CREATE]),
  validate(V.createHouseSchema),
  ctrl.createHouse
)

router.get(
  '/',
  // permit([P.HOUSE.READ]),
  ctrl.listHouses
)

router.patch(
  '/:id',
  // permit([P.HOUSE.UPDATE]),
  validate(V.updateHouseSchema),
  ctrl.updateHouse
)

router.delete(
  '/:id',
  // permit([P.HOUSE.DELETE]),
  validate(V.deleteHouseSchema),
  ctrl.deleteHouse
)

module.exports = router
