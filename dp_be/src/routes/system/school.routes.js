const express = require('express')
const schoolController = require('../../controllers/system/school.controller')
const validate = require('../../middlewares/validate.middleware')
const schoolValidation = require('../../validations/system/school.validation')
const authGuard = require('../../middlewares/authGuard')
const P = require('../../constants/permissions')

const router = express.Router()

router.get('/config', authGuard(), schoolController.getSchoolConfig)
router.patch('/config', authGuard(P.ORGANIZATION_CALENDAR.UPDATE), validate(schoolValidation.updateSchoolConfigSchema), schoolController.updateSchoolConfig)

module.exports = router
