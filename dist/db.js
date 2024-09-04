"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let userSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true,
    },
    company: {
        type: String
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    updateUser: {
        type: Boolean
    },
    sentCopy: {
        type: Boolean
    }
});
let User = mongoose_1.default.model('user', userSchema);
exports.default = User;
