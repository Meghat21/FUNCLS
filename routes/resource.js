const express = require('express')
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  categoryPhotoUpload
} = require('../controllers/resources')

const Resource = require('../models/Resources')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
// router.use()

router
  .route('/')
  .get(advancedResults(Resource), getResources)
  .post(authorize('admin'), createResource)

router
  .route('/:id')
  .get(getResource)
  .put(authorize('admin'), updateResource)
  .delete(authorize('admin'), deleteResource)

router.route('/:id/photo').put(authorize('admin'), categoryPhotoUpload)

module.exports = router
