const { siteSchema, reviewSchema, roomSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Site = require('./models/site')
const Room = require('./models/room')
const Review = require('./models/review')

/* 
    pageNotFound when trying to use req.originalUrl because it really doesn't exist
    example:
    /sites/6119340f6eff882af52d2d84/reviews/611937836bdfec2cd851114d?_method=DELETE
    if you put this in the URL it will hit the error handler, because no route matches this get request
    method_override is not working here.
    it is not hitting the delete route at all. 
    instead, it is being treated as a get request

    the reason that no route is matching this is because, when you click the delete button,
    the query is sent as a POST request, instead of a GET request.
    but in redirection, the server tells browser to "go to that link" and the browser uses GET request
    to reach that link.

    In case of editing, if the user is not logged in, it will login and then land back on edit page.
    Instead, of trying to send a UPDATE request unlike how the delete is sending the DELETE request directly.

    While trying to delete site, the same thing is happening. The site isn't getting deleted right away.
    You'll have to click delete again.
    But "Page Not Found" is not showing up, because 
    http://localhost:3000/sites/6119340f6eff882af52d2d8c?_method=DELETE
    exists. 
    The "?_method=DELETE" is getting ignored
*/

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateSite = (req, res, next) => {
    const { error } = siteSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.validateRoom = (req, res, next) => {
    const { error } = roomSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const site = await Site.findById(id)
    if(!site.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/sites/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that!')

        const firstUrlRoute = req.baseUrl.split('/')[1];
        switch (firstUrlRoute) {
            case 'sites':
                {
                    return res.redirect(`/sites/${id}`)
                }

            case 'rooms':
                {
                    return res.redirect(`/rooms/${id}`)
                }
        }
    }
    next()
}

module.exports.isAuthorR = async (req, res, next) => {
    const { id } = req.params
    const room = await Room.findById(id)
    if(!room.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/rooms/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        next()
    }
}
