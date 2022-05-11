if(process.env.NODE_ENV !== "production") require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize')

const userRoutes = require('./routes/users')
const siteRoutes = require('./routes/sites')
const reviewRoutes = require('./routes/reviews')

const Site = require('./models/site')
const catchAsync = require('./utils/catchAsync')
const { strict } = require('assert')

const MongoStore = require('connect-mongo');

mongoose.connect(process.env.DB_URI, {
    "user": process.env.DB_USERNAME,
    "pass": process.env.DB_PASSWORD,
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "useCreateIndex": true,
    "useFindAndModify": false,
    "authSource": "admin"
})
    .then(() => {
        console.log("Mongoose connected to mongodb successfully.");
    })
    .catch(err => {
        console.log(err);
    });


const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const store = MongoStore.create({
    mongoUrl: process.env.DB_URI,
    secret: process.env.MSTORE_SEC,
    touchAfter: 24 * 60 * 60
});

store.on('error', function(e){
    console.log('SESSION STORE ERROR', e)
});

const sessionConfig = {
    store,
    name:'_utma',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({ contentSecurityPolicy: false }))

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com",
//     "https://api.tiles.mapbox.com",
//     "https://api.mapbox.com",
//     "https://kit.fontawesome.com",
//     "https://code.jquery.com",
//     "https://cdnjs.cloudflare.com",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com",
//     "https://stackpath.bootstrapcdn.com",
//     "https://api.mapbox.com",
//     "https://api.tiles.mapbox.com",
//     "https://fonts.googleapis.com",
//     "https://use.fontawesome.com",

//     // "https://getbootstrap.com"
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com",
//     "https://*.tiles.mapbox.com",
//     "https://events.mapbox.com",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             childSrc: ["blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/m96/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/autocomplete', catchAsync(async (req, res) => {
    const regex = new RegExp(req.query["term"], 'i')
    const sites = await Site.find({title: regex}, {title: 1}).sort({"updated_at": -1}).sort({"created_at": -1}).limit(20)
    let result = []
    if(sites.length>0){
        sites.forEach(s => {
            let obj = {
                id: s._id,
                label: s.title
            }
            result.push(obj)
        })
    }
    res.jsonp(result)
}))

app.get('/findSite', catchAsync(async (req, res) => {
    const { findSite } = req.query
    const site = await Site.findOne({title: findSite})
    res.redirect(`/sites/${site._id}`)
}))

app.use('/', userRoutes)
app.use('/sites', siteRoutes)
app.use('/sites/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})