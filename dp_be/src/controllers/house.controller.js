const houseService = require('../services/house.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.createHouse = asyncHandler(async (req, res) => {
  const house = await houseService.createHouse({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(house))
})

exports.listHouses = asyncHandler(async (req, res) => {
  const items = await houseService.listHouses({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateHouse = asyncHandler(async (req, res) => {
  const house = await houseService.updateHouse({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(house))
})

exports.deleteHouse = asyncHandler(async (req, res) => {
  await houseService.deleteHouse({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
