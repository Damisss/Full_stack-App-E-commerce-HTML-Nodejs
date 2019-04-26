const mongoose = require('mongoose')
const User = require('../models/user')
try {
    mongoose.connect('database')
} catch (error) {
    mongoose.createConnection('database')
}

mongoose.connection
.once('open', ()=>console.log('mongoose is runing'))
.on('error', (err)=>console.log(err))