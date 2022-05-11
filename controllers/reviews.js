const Site = require('../models/site')
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    const site = await Site.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    site.reviews.push(review)
    await review.save()
    await site.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/sites/${site._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Site.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/sites/${id}`)
}