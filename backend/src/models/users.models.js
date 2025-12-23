import dotenv from "dotenv"
dotenv.config()

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const resume = mongoose.Schema({
    url: String,
    publicId: String,
    fileName: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const resumeListSchema = mongoose.Schema({
    1: { type: resume, default: null },
    2: { type: resume, default: null },
    3: { type: resume, default: null },
}, { _id: false });

const userSchema = mongoose.Schema({
    userName : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim: true,
        index: true,
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim: true,
        index: true,
    },
    fullName : {
        type : String,
        required : true,
        lowercase : true,
        trim: true,
    },
    password : {
        type : String,
        required : true,
    },
    mobile : {
        type : String,
        trim: true,
        default: null,
    },
    emailVerified : {
        type : Boolean,
        default: false,
    },
    mobileVerified : {
        type : Boolean,
        default: false,
    },
    profilePhoto: {
        imageUrl: {
            type: String,
            default: null,
        },
        publicId: {
            type: String,
            default: null,
        }
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    resumes: {
        type: resumeListSchema,
        default: () => ({})
    },
    highestQualification : {
        type : String,
        enum: ['10th', '12th', 'graduation', 'postgraduation', null],
        default: null,
    },
    qualifications : {
        tenth: {
            completed: { type: Boolean, default: false },
            startYear: Number,
            endYear: Number,
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            board: String,
            schoolName: String,
            yearOfPassing: Number,
        },
        twelfth: {
            completed: { type: Boolean, default: false },
            startYear: Number,
            endYear: Number,
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            board: String,
            schoolName: String,
            stream: String,
            yearOfPassing: Number,
        },
        graduation: {
            completed: { type: Boolean, default: false },
            courseName: String,
            startYear: Number,
            endYear: Number,
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            degree: String,
            university: String,
            collegeName: String,
            specialization: String,
            yearOfPassing: Number,
        },
        postgraduation: {
            completed: { type: Boolean, default: false },
            courseName: String,
            startYear: Number,
            endYear: Number,
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            degree: String,
            university: String,
            collegeName: String,
            specialization: String,
            yearOfPassing: Number,
        }
    },
    refreshToken: String
}, {timestamps: true,})

userSchema.methods.isPasswordCorrect = async function (password){
    if(!password) return false;
    
    return await bcrypt.compare(password, this.password);
}

userSchema.pre('save', async function(){
    if(!this.isModified('password'))
        return ;
    
    this.password = await bcrypt.hash(this.password, 10)
});

// Compute whether profile is completed based on required fields and verifications
userSchema.methods.computeProfileCompleted = function() {
    const hasResume = (() => {
        const r = this.resumes || {};
        if (Array.isArray(r)) return r.length > 0;
        return [1,2,3].some(i => !!r[i] || !!r[String(i)]);
    })();

    return Boolean(
        this.fullName &&
        this.mobile &&
        this.highestQualification &&
        hasResume &&
        this.emailVerified &&
        this.mobileVerified
    );
};

// Ensure profileCompleted is kept in sync whenever user is saved
userSchema.pre('save', function() {
    try {
        this.profileCompleted = this.computeProfileCompleted();
    } catch (e) {
        // ignore compute errors and proceed
    }
});

userSchema.methods.generateRefreshToken = async function(){
    const payload = {
        _id: this._id,
        email: this.email,
        userName: this.userName
    };

    const options = {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Token will expire in 1 hour
        algorithm: 'HS256' // HMAC SHA256 algorithm
    };

    const refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
    // console.log('Generated JWT:', refreshToken);

    return refreshToken
};

userSchema.methods.generateAccessToken = async function(){
    const payload = {
        _id: this._id,
        email: this.email,
        userName: this.userName
    };

    const options = {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Token will expire in 1 hour
        algorithm: 'HS256' // HMAC SHA256 algorithm
    };

    const accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
    // console.log('Generated JWT:', accessToken);

    return accessToken
};

export const User = mongoose.model('User', userSchema);