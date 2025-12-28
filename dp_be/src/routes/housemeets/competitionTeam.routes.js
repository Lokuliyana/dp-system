const router = require('express').Router()
const ctrl = require('../../controllers/housemeets/competitionTeam.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/housemeets/competitionTeam.validation')

router.post(
  '/',
  // permit([P.COMPETITION_TEAM.CREATE]),
  validate(V.createTeamSchema),
  ctrl.createTeam
)

router.get(
  '/',
  // permit([P.COMPETITION_TEAM.READ]),
  validate(V.listTeamsSchema),
  ctrl.listTeams
)

router.patch(
  '/:id',
  // permit([P.COMPETITION_TEAM.UPDATE]),
  validate(V.updateTeamMembersSchema),
  ctrl.updateTeamMembers
)

router.delete(
  '/:id',
  // permit([P.COMPETITION_TEAM.DELETE]),
  validate(V.deleteTeamSchema),
  ctrl.deleteTeam
)

module.exports = router
