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
api.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // Set this to your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
                if (!user) {
                    yield db_1.default.create({
                        fullName: `${emailData.lastName} ${emailData.firstName}`,
                        email: emailData.email,
                        company: emailData.companyName,
                        phoneNumber: emailData.phoneNumber,
                        updateUser: emailData.uClient,
                        sentCopy: emailData.sCopy
                    });
                }
                let transporter = nodemailer_1.default.createTransport({
                    host: 'mail.alcoen.net',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.MEMAIL,
                        pass: process.env.PASS
                    },
                });
                let mailOptions = {
                    from: process.env.MEMAIL,
                    to: process.env.DEMAIL,
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
                    let emailSent = yield transporter.sendMail(mailOptions);
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
                            yield transporter.sendMail(mailOptions);
                        }
                        // Send response only once, after both emails are successfully sent
                        return res.status(200).json({ message: 'email sent' });
                    }
                    else {
                        throw new Error('Error: email was not sent');
                    }
                }
                catch (error) {
                    console.error('error sending mail:', error);
                    return res.status(500).json({ message: `failed request at: ${error.message}` });
                }
            }
            else {
                return res.status(400).json({ message: 'invalid phone number' });
            }
        }
        else {
            return res.status(400).json({ message: 'invalid email' });
        }
    }
}));
api.get('/', (req, res) => {
    console.log('request came');
    res.status(201).json({ message: 'wroking' });
});
exports.default = api;
