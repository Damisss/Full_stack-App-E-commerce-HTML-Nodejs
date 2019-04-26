const express = require('express');
const controllerAuth = require('../controllers/auth')
const {check, body} = require('express-validator/check')
const User = require('../models/user')
const router = express.Router();
// //get all product
router.get('/login', controllerAuth.login);
router.post('/login',[check('email')
.isEmail().normalizeEmail()
.withMessage('Please enter valid email'),
body('password', 'Password must be at least 5 characters')
.isAlphanumeric().isLength({min: 5})
.trim()
],
 controllerAuth.postLogin)
router.post('/logout', controllerAuth.postLogout)
router.get('/signup', controllerAuth.getSignup);
router.post('/signup', 
[check('email').isEmail().withMessage('Please enter a valid email').normalizeEmail()
.custom((value, {req})=>{
    return User.findOne({email: value})
  .then(userDoc=>{
    if(userDoc){
      return Promise.reject(' Email already exist.')
    }
})
}),
body('password', 'The password must be at least 5 characters')
.isLength({min: 5}).isAlphanumeric().trim(),
body('confirmPassword').custom((value, {req})=>{
    if(value !== req.body.password){
        throw new Error('password must match')
    }
    return true
}).trim()],
 controllerAuth.postSignup);
router.get('/reset', controllerAuth.getReset)
router.post('/reset', controllerAuth.postReset)
router.get('/reset/:token', controllerAuth.getNewPassword)
router.post('/new-password', controllerAuth.postNewPassword)


module.exports = router