import express from 'express';
import { AppUserModel } from '../db-utils/module.js';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from "crypto";
import nodemailer from "nodemailer"
const authRouter = express.Router();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user:  'sparrowkarthik007@gmail.com',
      pass: 'gess xxge ihrh vrys',
    },
  });

authRouter.post('/register', async (req, res) => {

    try {
        const payload = req.body;
        const appUser = await AppUserModel.findOne({ email: payload.email }, { id: 1, Name: 1, email: 1, _id: 0 });
        if (appUser) {
            res.status(409).send({ msg: 'user already exits' });
            return;
        }
        // hashing the password for storing in db
        bcrypt.hash(payload.password, 10, async function (err, hash) {
            if (err) {
                res.status(500).send({ msg: 'Error in registring' });
                return;
            }
            const authuser = new AppUserModel({ ...payload, password: hash, id: v4(), isVerified: false });
            await authuser.save();
        })
        res.send({ msg: 'user register successfully ' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ msg: 'Error in creating' })
    }
});




authRouter.post('/login', async function (req, res) {
    try {
        const payload = req.body;
        const appUser = await AppUserModel.findOne({ email: payload.email }, { id: 1, name: 1, email: 1, password: 1, _id: 0 });
        if (appUser) {
            await bcrypt.compare(payload.password, appUser.password, (err, result) => {
                if (err) {
                    res.status(401).send({ msg: "invalid credentials" });
                } else {
                    const responceObj = appUser.toObject();
                    delete responceObj.password;
                    res.send(responceObj);
                }
            })
        }
        else {
            res.status(404).send({ msg: 'user not found' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(404).send({ msg: 'user not found' });
    }
});



authRouter.post('/password', async function (req, res) {
    try {
     const token = crypto.randomBytes(20).toString('hex');
     const email = req.body.email;
   
     // Create a password reset link with the token and send it via email
    
     const appUser = await AppUserModel.findOne({ email: email }, { name: 1, email: 1, _id: 0 });
     if(appUser){
       const  resetkey = `${process.env.FRONTEND_URL}/reset/${token}`;
        await AppUserModel.updateOne({ email: email }, { '$set': { ResetKey: resetkey } });
     
     
     const mailOptions = {
       from: 'your_email@gmail.com',
       to: email,
       subject: 'Password Reset Request',
       text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link to complete the process:\n\n${ resetkey}\n\n
              If you did not request this, please ignore this email and your password will remain unchanged.\n`,
     };
   
     transporter.sendMail(mailOptions, (error) => {
       if (error) {
         console.log(error);
         res.status(500).send('Failed to send the password reset email.');
       } else {
         res.render('reset-success');
       }
     });
   }else{
     res.status(404).send({ msg: 'user not found' });
   }
    } catch (err) {
     console.log(err);
     res.status(500).send({ msg: 'Error in updating' })
    }
   
   });
           
     





authRouter.put('/validate', async function (req, res) {
    const payload = req.body;
    try {
        const appUser = await AppUserModel.findOne({ ResetKey: payload.resetKey }, { ResetKey: 1, _id: 0 });
        if (!appUser) {
            res.status(404).send({ msg: 'key not found' });
            console.log("payload");
        } else {
            if (payload.resetKey === appUser.ResetKey) {
                console.log("true");
                res.send("true");
            } else {
                console.log("false");
                res.send("false");
            }
        }
    } catch {
        res.status(404).send({ msg: 'user not found 123' });
    }
})


authRouter.put('/reset', async function (req, res) {
    const payload = req.body;

    try {
        // hashing the password for storing in db
        bcrypt.hash(payload.password, 10, async function (err, hash) {
            if (err) {
                res.status(400).send({ msg: 'Error in reseting' });
                return;
            }
            await AppUserModel.updateOne({ email: payload.email }, { '$set': { password: hash } });
            res.send({ msg: 'user updated ' });
        })
    } catch (err) {
        console.log(err);
        res.status(500).send({ msg: 'Error in updating' })
    }




});
export default authRouter;
