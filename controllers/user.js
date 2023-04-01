const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isStringInvalid(string){

    if(string == undefined || string.length === 0){
        return true;
    }
    else{
        return false;
    }
}

const signup = async (req, res, next) => {

    console.log(req.body)

    try{
        const {name, email, password} = req.body;

        if(isStringInvalid(name) || isStringInvalid(email || isStringInvalid(password))){
            return res.status(400).json({err : 'bad parameters . something is missing'})
        }

        const user = User.findAll({where:{email}})
        if(user.length>0){
            return res.status(409).json({message:'user already exist'})
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            console.log(err);
            await User.create({name, email, password: hash})
            .then(() => {
                res.status(201).json({message: 'successfully new user created'})
            })
            .catch(err => console.log(err))
            })

        
    }

    catch(err){
        res.status(500).json(err)
    }


}

const generateAccessToken = (id, name,ispremiumuser) => {
    return jwt.sign({ userId: id, name: name, ispremiumuser}, 'secretkey');
}


const signin = async (req, res, next) => {

    console.log(req.body)

    try{
        const {email, password} = req.body;

        if(isStringInvalid(email) || isStringInvalid(password)){
            return res.status(400).json({err : 'email or password is missing', success: false})
        }

        // if(password == undefined || password.length === 0 || email == undefined || email.length === 0){
        //     return res.status(400).json({err:'bad parameter'})
        // }

        const user = await User.findAll({where:{email}})

        if(user.length > 0){

            bcrypt.compare(password, user[0].password, (err,data)=>{
                if(err){
                    return res.status(500).json({success: false, message:'something went wrong'})
                }
                if(data===true){
                    return res.status(201).json({message:'login success', success : true, token: generateAccessToken(user[0].id, user[0].name, user[0].ispremiumuser) });
                               
                }
                else{
                    return res.status(400).json({success: false, message:'Password is Incorrect'})
                }
                })
        }

        else{
            return res.status(404).json({err: 'User Not Found', success: false})
        }
    
    }

    catch(err){
        res.status(500).json({message: err, success: false})
    }


}

module.exports = {
    signup,
    signin,
    generateAccessToken
}