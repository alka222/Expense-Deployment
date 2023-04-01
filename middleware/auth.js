const jwt = require('jsonwebtoken')
const User = require('../models/users')

exports.authentication = (req,res,next)=>{
    const token = req.header('Authorization');
    const user = (jwt.verify(token , 'secretkey' ))
    console.log(user.userId)
    User.findByPk(user.userId).then(foundUser=>{
        req.user = foundUser ;
        console.log(foundUser+"this is founduser")
        next();
    })
    

}