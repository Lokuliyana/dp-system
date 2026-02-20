const router = require('express').Router()
const ctrl = require('../../controllers/activities/club.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/activities/club.validation')

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

router.post(
  '/:id/members/bulk',
  // permit([P.CLUB.UPDATE]),
  ctrl.bulkAssignMembers
)

router.delete(
  '/:id/members/:studentId',
  // permit([P.CLUB.UPDATE]),
  ctrl.removeMember
)

module.exports = router
