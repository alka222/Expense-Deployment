const express = require('express')
const router = express.Router();
const expenseController= require('../controllers/expense')
const userAuthenticate = require('../middleware/auth')

router.post('/addexpense',userAuthenticate.authentication,expenseController.addExpense)

router.post('/:pageno',userAuthenticate.authentication,expenseController.getExpenses)

router.delete('/delete/:userID',userAuthenticate.authentication,expenseController.deleteExpense)
router.get('/download' , userAuthenticate.authentication ,expenseController.downloadExpense )
router.get('/getAllDownloadUrl' , userAuthenticate.authentication ,expenseController.downloadAllUrl )


module.exports=router;