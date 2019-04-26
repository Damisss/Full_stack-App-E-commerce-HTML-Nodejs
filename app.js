const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')


const User = require('./models/user')
const app = express();
const store = new MongoDBStore({
    uri: 'mongodb+srv://Adama:Password@cluster0-5po2q.mongodb.net/Shop?retryWrites=true',
    collection: 'sessions'
})
const fileStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, './images')
  },
  filename: (req, file, cb)=>{
    cb(null, new Date().toISOString() + '-' +file.originalname)
  }
})
const csrfProtection = csrf()
require('./util/database')
app.set('view engine', 'ejs');
app.set('views', 'views');
const fileFilter = (req, file, cb)=>{
  if(file.mimetype === 'image/jpeg'|| file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
    cb(null, true)
  } else{
    cb(null, false)
  }
}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter:fileFilter, limits:{
  fieldSize: 1024*1024*5
} }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session(
    {secret: 'My secret', 
    resave: false, 
    saveUninitialized: false,
    store: store}
    ))
app.use(csrfProtection) 
app.use(flash())
app.use((req, res, next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})
  app.use((req, res, next) => {
        if (!req.session.user) {
          return next();
        }
        User.findById(req.session.user._id)
          .then(user => {
            if (!user) {
              return next();
            }
            req.user = user;
            next();
          })
          .catch(err => {
            next (new Error(err))
          });
      });
            
app.use('/admin', adminRoutes)
app.use(shopRoutes);
app.use(authRoutes)
app.use('/500', errorController.get500)
app.use(errorController.get404);
app.use((error, req, res, next)=>{
  
  res.redirect('/500')
  // const errors = new Error(error)
  //   error.httpStatusCode = 500,
  //   //res.status(error.httpStatusCode).json()
  //   next(errors)
})
app.listen(3000);
