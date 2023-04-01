const Razorpay = require('razorpay');
const Order = require('../models/order');
const userController = require('./user')

require('dotenv').config()

exports.purchasepremium = (req,res,next)=>{
    try{
        const rzp = new Razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET
        });

        console.log("rzp>>>>>> " + rzp )

        const amount = 2500;

        rzp.orders.create({amount, currency: 'INR'}, (err, order) => {
            if(err){
                throw new Error(JSON.stringify(err));
            }

            // res.json({order, key_id: rzp.key_id});
            
            req.user.createOrder({ orderId: order.id, status: 'PENDING'})
            .then(() => {
                return res.status(201).json({order, key_id: rzp.key_id})
            })
            .catch(err => {
                throw new Error(err);
            })
        })
    }

    catch(err){
        console.log(err);
        res.status(403).json({message: 'something went wrong', error: err})
    }
}

exports.updateTransactionStatus = async(req,res,next)=>{
    try{
        const userId = req.user.id;
        const { payment_id, order_id } = req.body;


        const order = await Order.findOne({ where: {orderId: order_id }})

        const promise1 = order.update({ paymentId: payment_id, status: 'SUCCESSFUL'});
        const promise2 = req.user.update({ ispremiumuser: true });

        Promise.all([promise1, promise2]).then(() => {
            return res.status(202).json({success: true, message: "Transaction Successful", token: userController.generateAccessToken(userId,undefined , true) });
        })
        
        .catch(err=> {
            throw new Error(err);
        })

        
    }

    catch(err){
        console.log(err);
        res.status(403).json({message: 'something went wrong', error: err})
    }
}
