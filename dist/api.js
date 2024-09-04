"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./db"));
(0, dotenv_1.configDotenv)();
const cors_1 = __importDefault(require("cors"));
let api = (0, express_1.default)();
mongoose_1.default.connect(process.env.CONNECTION_STRING, { dbName: 'ALCOEN' }).then(() => console.log('connected to db'));
api.listen(process.env.PORT, () => console.log('currently listening at port ' + process.env.PORT));
api.use(express_1.default.json());
api.use((0, cors_1.default)());
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
// Helper function to validate if a string is a valid phone number
function isValidPhoneNumber(phoneNumber) {
    const re = /^\d+$/;
    return re.test(phoneNumber);
}
api.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('request came');
    let emailData = req.body;
    if (emailData) {
        if (isValidEmail(emailData.email)) {
            if (isValidPhoneNumber(emailData.phoneNumber)) {
                let user = yield db_1.default.findOne({ email: emailData.email });
                user ? console.log('user already saved') : db_1.default.create({
                    fullName: `${emailData.lastName} ${emailData.firstName}`,
                    email: emailData.email,
                    company: emailData.companyName,
                    phoneNumber: emailData.phoneNumber,
                    updateUser: emailData.uClient,
                    sentCopy: emailData.sCopy
                });
                console.log(process.env.PASS);
                let transporter = nodemailer_1.default.createTransport({
                    host: 'mail.alcoen.net',
                    port: 465, // or 465 for SSL
                    secure: true,
                    auth: {
                        user: process.env.MEMAIL,
                        pass: process.env.PASS
                    },
                });
                console.log('we are here');
                console.log(emailData.message);
                let mailOptions = {
                    from: process.env.MEMAIL,
                    to: process.env.DEMAIL,
                    subject: 'business interest',
                    html: `
                         <h3>Mr/Mrs ${emailData.firstName} ${emailData.lastName} from ${emailData.companyName} shows interest in working together</h3>
                         <p>Mr/Mrs left ALCOEN their contact informations along with a message experssig their interest in a potenial business deal between the two companies, starting with their message </p>
                         <p>${emailData.message}</p>
                         <h4>Contact informations :</h4>
                         <ul>
                              <li> ${emailData.email}</li>
                              <li> ${emailData.phoneNumber}</li>
                         </ul>
                         `
                };
                console.log('Email message:', mailOptions);
                try {
                    let emailSent = yield transporter.sendMail(mailOptions);
                    if (emailSent.accepted.length > 0) {
                        if (emailData.sCopy) {
                            mailOptions.to = emailData.email;
                            mailOptions.subject = 'Thank you for contacting Alcoen';
                            mailOptions.html = `
                                        <p> this is a copy of the message you sent to Alcoen, Alcoen's team will reach out to you as soon as possible in the mean time thanks for contacting ALCOEN</p>
                                        <h3>Mr/Mrs ${emailData.firstName} ${emailData.lastName} from ${emailData.companyName} shows interest in working together</h3>
                                        <p>Mr/Mrs left ALCOEN their contact informations along with a message experssig their interest in a potenial business deal between the two companies, starting with their message </p>
                                        <p>${emailData.message}</p>
                                        <h4>Contact informations :</h4>
                                        <ul>
                                             <li> ${emailData.email}</li>
                                             <li> ${emailData.phoneNumber}</li>
                                        </ul>
                                        <p> A copy of this message will be sent Mr/Mrs ${emailData.lastName}</p>`;
                            let copySent = yield transporter.sendMail(mailOptions);
                            if (copySent.accepted.length > 0) {
                                res.status(200).json({ message: 'email sent ' });
                            }
                            else {
                                throw new Error('error sending the copy Email');
                            }
                        }
                        res.status(200).json({ message: 'email sent ' });
                    }
                    else {
                        throw new Error('Error: email was not sent');
                    }
                }
                catch (error) {
                    console.error('error sending mail: ' + error);
                    res.status(401).json({ message: `failed request at: ${error}` });
                }
            }
            else {
                res.status(401).json({ message: 'unvalid phone number' });
            }
        }
        else {
            res.status(401).json({ message: 'unvalid email' });
        }
    }
}));
api.get('/', (req, res) => {
    console.log('request came');
    res.status(201).json({ message: 'email sent' });
});
