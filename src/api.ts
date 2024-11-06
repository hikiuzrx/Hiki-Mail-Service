import express,{ Express,Request,Response } from "express";
import nodemailer from 'nodemailer'
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import User from "./db";
configDotenv()
import cors from 'cors'

let api:Express = express()
mongoose.connect(process.env.CONNECTION_STRING as string,{dbName:'ALCOEN'}).then(()=> console.log('connected to db'))
api.listen(process.env.PORT,()=> console.log('currently listening at port '+ process.env.PORT))
api.use(express.json())
api.use(cors())
function isValidEmail(email:string):boolean {
     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return re.test(email);
   }

   
   // Helper function to validate if a string is a valid phone number
   function isValidPhoneNumber(phoneNumber:string):boolean {
     const re = /^\d+$/;
     return re.test(phoneNumber);
   }
   api.post('/', async (req: Request, res: Response) => {
     console.log('request came');
     let emailData: any | undefined = req.body;

     if (emailData) {
          if (isValidEmail(emailData.email)) {
               if (isValidPhoneNumber(emailData.phoneNumber)) {
                    let user = await User.findOne({ email: emailData.email });
                    if (!user) {
                         await User.create({
                              fullName: `${emailData.lastName} ${emailData.firstName}`,
                              email: emailData.email,
                              company: emailData.companyName,
                              phoneNumber: emailData.phoneNumber,
                              updateUser: emailData.uClient,
                              sentCopy: emailData.sCopy
                         });
                    }

                    let transporter = nodemailer.createTransport({
                         host: 'mail.alcoen.net',
                         port: 465,
                         secure: true,
                         auth: {
                              user: process.env.MEMAIL as string,
                              pass: process.env.PASS as string
                         },
                    });

                    let mailOptions = {
                         from: process.env.MEMAIL as string,
                         to: process.env.DEMAIL as string,
                         subject: 'business interest',
                         html: `
                         <h3>Mr/Mrs ${emailData.firstName} ${emailData.lastName} from ${emailData.companyName} shows interest in working together</h3>
                         <p>Mr/Mrs left ALCOEN their contact informations along with a message expressing their interest in a potential business deal between the two companies.</p>
                         <p>${emailData.message}</p>
                         <h4>Contact informations:</h4>
                         <ul>
                              <li>Email: ${emailData.email}</li>
                              <li>Phone: ${emailData.phoneNumber}</li>
                         </ul>
                         `
                    };

                    try {
                         let emailSent = await transporter.sendMail(mailOptions);
                         console.log('email sent');

                         if (emailSent.accepted.length > 0) {
                              if (emailData.sCopy) {
                                   // Send a copy to the sender if requested
                                   mailOptions.to = emailData.email;
                                   mailOptions.subject = 'Thank you for contacting Alcoen';
                                   mailOptions.html = `
                                        <p>This is a copy of the message you sent to Alcoen. Alcoen's team will reach out to you as soon as possible. Thank you for contacting ALCOEN.</p>
                                        <h3>Message details:</h3>
                                        <p>${emailData.message}</p>
                                        <h4>Contact informations:</h4>
                                        <ul>
                                             <li>Email: ${emailData.email}</li>
                                             <li>Phone: ${emailData.phoneNumber}</li>
                                        </ul>
                                   `;
                                   await transporter.sendMail(mailOptions);
                              }
                              // Send response only once, after both emails are successfully sent
                              return res.status(200).json({ message: 'email sent' });
                         } else {
                              throw new Error('Error: email was not sent');
                         }
                    } catch (error:any) {
                         console.error('error sending mail:', error);
                         return res.status(500).json({ message: `failed request at: ${error.message}` });
                    }
               } else {
                    return res.status(400).json({ message: 'invalid phone number' });
               }
          } else {
               return res.status(400).json({ message: 'invalid email' });
          }
     }
});

api.get('/',(req:Request,res:Response)=>{
     console.log('request came')
     res.status(201).json({message:'wroking'})
})
export default api