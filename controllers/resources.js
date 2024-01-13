const path = require('path')
const fs = require('fs')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Category = require('../models/Resources')

// @desc    Get resources
// @route   GET /api/v1/resources
// @access  Private/Admin
exports.getResources = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get single resources
// @route   GET /api/v1/resources/:id
// @access  Private/Admin
exports.getResource = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return next(
      new ErrorResponse(`No resources with that id of ${req.params.id}`)
    )
  }
  res.status(200).json({ success: true, data: category })
})

// @desc    Create resources
// @route   POST /api/v1/resources/
// @access  Private/Admin
exports.createResource = asyncHandler(async (req, res, next) => {
  let category = await Category.findOne({ title: req.body.title })

  if (category) {
    return next(new ErrorResponse('Title already exists', 400))
  }

  if (!req.files || !req.files.photo) {
    // return next(new ErrorResponse(`Please upload a photo`, 404))
    category = await Category.create({
      ...req.body,
      user: req.user.id
    })

    return res.status(200).json({ success: true, data: category })
  }

  const photo = req.files.photo

  if (!photo.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image photo`, 404))
  }

  if (photo.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD / 1000 / 1000
        }mb`,
        404
      )
    )
  }

  category = await Category.create({
    ...req.body,
    user: req.user.id
  })

  photo.name = `photo-${category._id}${path.parse(photo.name).ext}`

  photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`, async (err) => {
    if (err) {
      console.error(err)
      await Category.findByIdAndDelete(category._id)
      return next(new ErrorResponse(`Problem with photo upload`, 500))
    }

    category = await Category.findByIdAndUpdate(
      category._id,
      { photo: photo.name },
      { new: true }
    )

    return res.status(200).json({ success: true, data: category })
  })
})

// @desc    Update resources
// @route   PUT /api/v1/resources/:id
// @access  Private/Admin
exports.updateResource = asyncHandler(async (req, res, next) => {
  const question = await Category.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  })

  if (!question) {
    return next(new ErrorResponse(`No resource with id of ${req.params.id}`))
  }

  res.status(200).json({ success: true, data: question })
})

// // @desc    Update resources
// // @route   PUT /api/v1/resources/:id
// // @access  Private/Admin
// exports.updateResource = asyncHandler(async (req, res, next) => {
//   let category = await Category.findOneAndUpdate(
//     { _id: req.params.id },
//     req.body,
//     { new: true, runValidators: true },
//     function (err, data) {
//       if (err) {
//         // next(err)
//         console.log(err)
//         return next(
//           new ErrorResponse(
//             err.code == 11000
//               ? 'Title already exists'
//               : `Something went wrong with updating the image`
//           )
//         )
//       }

//       if (!data) {
//         return next(
//           new ErrorResponse(`No resources with id of ${req.params.id}`)
//         )
//       }

//       if (req.files) {
//         // console.log('el')
//         const photo = req.files.photo

//         if (!photo) {
//           return next(new ErrorResponse('Photo field is required', 400))
//         }

//         if (!photo.mimetype.startsWith('image')) {
//           return next(new ErrorResponse(`Please upload an image photo`, 404))
//         }

//         if (photo.size > process.env.MAX_FILE_UPLOAD) {
//           return next(
//             new ErrorResponse(
//               `Please upload an image less than ${
//                 process.env.MAX_FILE_UPLOAD / 1000 / 1000
//               }mb`,
//               404
//             )
//           )
//         }

//         photo.name = `photo-${data._id}${path.parse(photo.name).ext}`

//         if (data.photo !== 'no-photo.jpg') {
//           // fs.unlinkSync
//           fs.unlinkSync(
//             `${process.env.FILE_UPLOAD_PATH}/${data.photo}`,
//             (err) => {
//               if (err) {
//                 return next(
//                   new ErrorResponse(
//                     `Something went wrong with updating the image`,
//                     500
//                   )
//                 )
//               }
//               // return res.status(200).json({ success: true, data })
//             }
//           )
//         }

//         photo.mv(
//           `${process.env.FILE_UPLOAD_PATH}/${photo.name}`,
//           async (err) => {
//             if (err) {
//               console.error(err)
//               return next(new ErrorResponse(`Problem with photo upload`, 500))
//             }

//             data.photo = photo.name

//             await data.save()

//             res.status(200).json({ success: true, data })
//           }
//         )
//       } else {
//         return res.status(200).json({ success: true, data: data })
//       }
//     }
//   )
// })

// @desc    Delete resources
// @route   DELETE /api/v1/resources/:id
// @access  Private/Admin
exports.deleteResource = asyncHandler(async (req, res, next) => {
  // const category = await Category.findByIdAndDelete(req.params.id)
  let category = await Category.findById(req.params.id)

  if (!category) {
    return next(
      new ErrorResponse(`No resources with id of ${req.params.id}`, 404)
    )
  }

  if (category && category.photo !== 'no-photo.jpg') {
    fs.unlink(
      `${process.env.FILE_UPLOAD_PATH}/${category.photo}`,
      async (err) => {
        await category.remove()
        if (err) {
          return next(
            new ErrorResponse(
              `Something went wrong, couldn't delete resources photo`,
              500
            )
          )
        }

        return res.status(200).json({ success: true, category })
      }
    )
  } else {
    await category.remove()
    return res.status(200).json({ success: true, category })
  }
})


// @desc    Upload photo for resources
// @route   PUT /api/v1/resources/:id/photo
// @access  Private Admin
exports.categoryPhotoUpload = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    )
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404))
  }

  const photo = req.files.photo

  if (!photo.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image photo`, 404))
  }

  if (photo.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD / 1000 / 1000
        }mb`,
        404
      )
    )
  }

  photo.name = `photo-${category._id}${path.parse(photo.name).ext}`

  photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse(`Problem with photo upload`, 500))
    }

    await Category.findByIdAndUpdate(req.params.id, { photo: photo.name })

    res.status(200).json({ success: true, data: photo.name })
  })
})
