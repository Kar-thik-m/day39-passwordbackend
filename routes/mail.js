import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv .config();
export const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.MAIL_NAME,
        pass:process.env.MAIL_PASS,
    }
})

export const mailOptions={
    from:"sparrowkarthik007@gmail.com",
    to:'sparrowkarthik007@gmail.com',
    subject:'hi',
    text:'well come'
}