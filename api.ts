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
api.post('/', async (req:Request,res:Response)=>{
     console.log('request came')
     let emailData:any|undefined =req.body
     if(emailData){
          if(isValidEmail(emailData.email)){
               if(isValidPhoneNumber(emailData.phoneNumber)){
                    let user = await User.findOne({email:emailData.email})
                    user? console.log('user already saved'):User.create({
                         fullName:`${emailData.lastName} ${emailData.firstName}`,
                         email:emailData.email,
                         company:emailData.companyName,
                         phoneNumber:emailData.phoneNumber,
                         updateUser:emailData.uClient,
                         sentCopy:emailData.sCopy
                    })
                    console.log(process.env.PASS)
                    let transporter = nodemailer.createTransport({
                         host: 'mail.alcoen.net',
                         port: 465, // or 465 for SSL
                         secure:true ,
                         auth:{
                              user:process.env.MEMAIL as string,
                              pass:process.env.PASS as string
                         },
                         
                    })
                    console.log('we are here')
                    console.log(emailData.message)
                    let mailOptions ={
                         from :process.env.MEMAIL as string,
                         to :process.env.DEMAIL as string,
                         subject :'business interest',
                         html:`
                         <h3>Mr/Mrs ${emailData.firstName} ${emailData.lastName} from ${emailData.companyName} shows interest in working together</h3>
                         <p>Mr/Mrs left ALCOEN their contact informations along with a message experssig their interest in a potenial business deal between the two companies, starting with their message </p>
                         <p>${emailData.message}</p>
                         <h4>Contact informations :</h4>
                         <ul>
                              <li> ${emailData.email}</li>
                              <li> ${emailData.phoneNumber}</li>
                         </ul>
                         `
                    }
               
                    console.log('Email message:', mailOptions);
                    try{
                         let emailSent =   await transporter.sendMail(mailOptions)
                         if (emailSent.accepted.length > 0) {
                              if(emailData.sCopy){
                                   mailOptions.to = emailData.email
                                   mailOptions.subject = 'Thank you for contacting Alcoen'
                                   mailOptions.html= `
                                        <p> this is a copy of the message you sent to Alcoen, Alcoen's team will reach out to you as soon as possible in the mean time thanks for contacting ALCOEN</p>
                                        <h3>Mr/Mrs ${emailData.firstName} ${emailData.lastName} from ${emailData.companyName} shows interest in working together</h3>
                                        <p>Mr/Mrs left ALCOEN their contact informations along with a message experssig their interest in a potenial business deal between the two companies, starting with their message </p>
                                        <p>${emailData.message}</p>
                                        <h4>Contact informations :</h4>
                                        <ul>
                                             <li> ${emailData.email}</li>
                                             <li> ${emailData.phoneNumber}</li>
                                        </ul>
                                        <p> A copy of this message will be sent Mr/Mrs ${emailData.lastName}</p>`
                                        let copySent = await transporter.sendMail(mailOptions)
                                        if(copySent.accepted.length > 0 ){
                                             res.status(200).json({message:'email sent '})  
                                        }else {
                                             throw new Error('error sending the copy Email')
                                        }
                              }
                              res.status(200).json({message:'email sent '})
                            } else {
                              throw new Error('Error: email was not sent');
                            }
                         
                    }catch (error) {
                         console.error('error sending mail: '+error)
                         res.status(401).json({message:`failed request at: ${error}`})
                    }
               }else{
                    res.status(401).json({message:'unvalid phone number'})
               }
          }else{
               res.status(401).json({message:'unvalid email'})
          }
     }
     
})
api.get('/',(req:Request,res:Response)=>{
     console.log('request came')
     res.status(201).json({message:'email sent'})
})
