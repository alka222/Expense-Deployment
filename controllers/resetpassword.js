const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');

require('dotenv').config()

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');





const forgotpassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json('User does not exist')
      }
  
      const UUID = uuid.v4();
      const forgotPasswordRecord = await Forgotpassword.create({ active: true, userId: user.id, id: UUID});
      console.log(forgotPasswordRecord)
  
      const client = Sib.ApiClient.instance
      const apiKey = client.authentications['api-key']
      apiKey.apiKey = process.env.SENDINBLUE_KEY;
      console.log(apiKey.apiKey)
  
      const tranEmailApi = new Sib.TransactionalEmailsApi()
      const sender = {
        email: 'alka.bhardwaj222@gmail.com',
        name: 'Alka Bhardwaj',
      }
      const receivers = [
        {
          email: email,
        },
      ]
      tranEmailApi
        .sendTransacEmail({
          sender,
          to: receivers,
          subject: "Reset your password",
          textContent: "Follow the link to reset password",
          htmlContent: `Click on the link below to reset password <br> <a href="http://localhost:3000/password/resetpassword/${forgotPasswordRecord.id}">Reset password</a>`,
        })
        .then((response) => {
          console.log(response)
          return res.status(202).json({ message: 'Link to reset password sent to your mail', success: true })
        })
        .catch((error) => {
          console.log(error)
          return res.status(500).json({ message: 'Failed to send email', success: false })
        });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Server error', success: false });
    }
  }
  

  const resetpassword = async(req, res, next) => {
    const UUid = req.params.id;
  
    try {
      const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id:UUid } });
      if (!forgotpasswordrequest) {
        return res.status(404).json('User doesnt exist');
      }
      forgotpasswordrequest.active = false;
      await forgotpasswordrequest.save();
  
      // Render HTML
      res.status(200).send(`
        <html>
          <style>
            body {
              background-image: linear-gradient(to right, lightgray, white);
              height: 100vh;
            }
            form {
              width: 400px;
              margin: 100px auto;
              text-align: center;
              background-color: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0px 0px 10px gray;
            }
            label {
              font-weight: bold;
              display: block;
              margin-bottom: 10px;
            }
            input[type="password"] {
              width: 100%;
              padding: 10px;
              font-size: 16px;
              margin-bottom: 20px;
              border: 1px solid gray;
              border-radius: 5px;
            }
            button {
              padding: 10px 20px;
              background-color: royalblue;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              cursor: pointer;
            }
          </style>
          <script>
            function formsubmitted(e) {
              e.preventDefault();
              console.log('called');
            }
          </script>
          <form action="/password/updatepassword/${UUid}" method="get">
            <label for="newpassword">Enter New password</label>
            <input name="newpassword" type="password" required />
            <button type="submit">reset password</button>
          </form>
        </html>
      `);
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  };

const updatepassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                // console.log('userDetails', user)
                if(user) {
                    //encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly updated the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }

}


module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}