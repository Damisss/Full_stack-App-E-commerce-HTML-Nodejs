const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult} = require('express-validator/check')

const transport = nodemailer.createTransport(sendGridTransport({
  auth:{
    api_key: ''
  }
}))


exports.login = (req, res, next) => {
  //console.log(req.get('Cookie').split('=')[1])
 // console.log(req.session)
 //const isLogin = req.session.isLoggedIn
 let message = req.flash('error')
 if(message.length>0){
   message = message[0]
 }else{
   message = null
 }
 res.render('auth/login', {
  path: '/login',
  pageTitle: 'Login',
  errorMessage: message,
  oldInput:{
    email: '',
    password: ''
  },
  validationError: []
});
  };

  exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if(message.length>0){
      message = message[0]
    }else{
      message = null
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: message,
      oldInput:{
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationError: []
    });
  };
  exports.postLogin = (req, res, next) => {
    //res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; Secure; HttpOnly')
    const {email, password} = req.body  
    const error = validationResult(req)
    if(!error.isEmpty()){
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'login',
        errorMessage: error.array()[0].msg,
        oldInput:{
          email: email,
          password: password
        },
        validationError: error.array()
      });
    }
      
     User.findOne({email: email})
       .then(user => {
         if(!user){
          req.flash('error', 'No such user.')
             return res.redirect('/login')
         }
      // }).then(user=>{
        bcrypt.compare(password, user.password)
       .then(isMatch =>{
        if(isMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password.')
         return res.redirect('/login');
      })
 }) 
  .catch(err => console.log(err));
};
exports.postSignup = (req, res, next) => {

  const {email, password, confirmPassword} = req.body
  const error = validationResult(req)
  if(!error.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: error.array()[0].msg,
      oldInput:{
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationError: error.array()
    });
  }
  // User.findOne({email: email})
  // .then(userDoc=>{
  //   if(userDoc){
  //     req.flash('error', ' Email already exist.')
  //     return res.redirect('/signup')
  //   }
  //   return
      bcrypt.hash(password, 12)
    .then( hashedPassword=>
      { const user = new User({email: email, password: hashedPassword})
      user.save()
     .then(user=>{
        res.redirect('/login')
        return transport.sendMail({
          to: email,
          from: 'Onlishop.com',
          subject: 'Signup succeeded',
          html: '<h1>Successfully signed up</h1>'
        })
     }).catch(err=>console.log(err))
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}

exports.getReset = (req, res, next)=>{
  let message = req.flash('error')
  if(message.length>0){
    message = message[0]
  }else{
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.postReset = (req, res, next)=>{
  crypto.randomBytes(32, (err, buffer)=>{
    if(err){
      req.flash('error', 'something wrong happened')
      return res.redirect('/reset')
    }
    const token =  buffer.toString('hex')
    User.findOne({email: req.body.email})
    .then(user=>{
       if(!user){
        req.flash('error', `Such email doesn't exist` )
        return res.redirect('/reset')
       }
       user.resetToken = token
       user.resetTokenExpiration = Date.now() + 3600000
       return user.save()
    }).then(result=>{
      res.redirect('/')
      return transport.sendMail({
        to: req.body.email,
        from: 'Onlishop.com',
        subject: 'Password Reset',
        html: `
        <p>You have requested a password reset</p>
        <p>Please click on below link to reset the password</p>
        <a href="http://localhost:3000/reset/${token}" >link Password</a>
        `
      })
    })
    .catch(err=>console.log(err))
  })
}

exports.getNewPassword =(req, res, next)=> {
   const {token} = req.params
   User.findOne({resetToken: token, resetTokenExpiration:{$gt: Date.now()}})
   .then(user=>{
    let message = req.flash('error')
    if(message.length>0){
      message = message[0]
    }else{
      message = null
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'Change password',
      errorMessage: message,
      userId: user._id.toString(),
      token: token
    });
   })
   .catch(err=>console.log(err))
}
exports.postNewPassword = (req, res, next)=>{
  const {token, userId, password} = req.body
  let userReset
  User.findOne({resetToken: token, _id: userId, 
    resetTokenExpiration: {$gt: Date.now()} })
    .then(user=>{
       userReset = user
        return bcrypt.hash(password, 12)
    }).then(result=>{
      userReset.password = result
      userReset.resetToken = undefined
      userReset.resetTokenExpiration = undefined
      return userReset.save()
    }).then(result=>{
      res.redirect('/login')
    })
    .catch(err=>console.log(err))
   
}