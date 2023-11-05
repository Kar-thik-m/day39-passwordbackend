import express from 'express';
import { AppUserModel } from '../db-utils/module.js';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';

import { mailOptions, transporter } from './mail.js';
const authRouter = express.Router();

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


authRouter.get('/:email', async function (req, res) {
    try {
        const email = req.params.email;
        const appUser = await AppUserModel.findOne({ email }, { id: 1, name: 1, email: 1, _id: 0 });
        res.send(appUser);
    } catch (err) {
        console.log(err);
        res.status(500).send({ msg: 'Error occuerred while fetching users' });
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






authRouter.post('/reset-password', async function (req, res){
    try {
        const resetKey = crypto.randomBytes(32).toString('hex');
        const payload = req.body;
        const appUser = await AppUserModel.findOne({ email: payload.email }, { name: 1, email: 1, _id: 0 });
        const cloudUser = await AppUserModel.updateOne({ email: payload.email }, { '$set': { ResetKey: resetKey } });
        if (appUser) {
            const responceObj = appUser.toObject();
            const link = `${process.env.FRONTEND_URL}/?reset=${resetKey}`
            console.log(link)
            await transporter.sendMail({ ...mailOptions, to: payload.email, text: link });
            res.send({ responceObj, msg: 'user updated ' });
        }
        else {
            res.status(404).send({ msg: 'user not found' });
        }
    }
    catch (err) {
        console.log(err);
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
