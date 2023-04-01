const express = require('express')
const app = express();
const dotenv = require('dotenv')
dotenv.config();
const sequelize = require('./util/database')
const cors= require('cors')
const helmet = require("helmet");
const compression=require('compression')
const morgan = require('morgan');
const fs = require('fs');
const accessLogStream = fs.createWriteStream('access.log', {flag: 'a'})
const bodyParser = require('body-parser')
const path = require("path");
const userRoutes= require('./Routes/user')
const expenseRouter = require('./Routes/expense')
const router = require('./Routes/user')
const User = require('./models/users')
const Expense = require('./models/expense');
const Order = require('./models/order');
const purchaseRouter = require('./Routes/purchase')
const premiumFeatureRouter = require('./Routes/premiumFeature')
const Forgotpassword = require('./models/forgotpassword')
const forgotpassRouter = require('./Routes/forgetpass')
const Downloadurl = require('./models/downloadurls');

app.use(express.json())

app.use(cors())
app.use(bodyParser.json({extended:false}))
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));


app.use('/user',userRoutes)
app.use('/expense',expenseRouter)
app.use('/payment' , purchaseRouter)
app.use('/premium',premiumFeatureRouter)
app.use('/password',forgotpassRouter)

Expense.belongsTo(User);
User.hasMany(Expense)

User.hasMany(Order)
Order.belongsTo(User)

Forgotpassword.belongsTo(User)
User.hasMany(Forgotpassword)

Downloadurl.belongsTo(User);
User.hasMany(Downloadurl);



sequelize.sync()
.then(()=>{
    app.listen(process.env.PORT || 3000 ,()=>{
        console.log('running');
    })
})
.catch(err=>{
    console.log(err)
})
