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

// const resumeListSchema = mongoose.Schema({
//     1: { type: resume, default: null },
//     2: { type: resume, default: null },
//     3: { type: resume, default: null },
// }, { _id: false });

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
        1: { type: resume, default: null },
        2: { type: resume, default: null },
        3: { type: resume, default: null },
    },
    highestQualification : {
        type : String,
        enum: ['tenth', 'twelfth', 'graduation', 'postgraduation', null],
        default: null,
    },
    qualifications : {
        tenth: {
            completed: { type: Boolean, default: false },
            startYear: {type : Number, default: null},
            endYear: {type : Number, default: null},
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            board: {type: String, default: null},
            schoolName: {type: String, default: null},
        },
        twelfth: {
            completed: { type: Boolean, default: false },
            startYear: {type : Number, default: null},
            endYear: {type : Number, default: null},
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            board: {type: String, default: null},
            schoolName: {type: String, default: null},
            stream: {type: String, default: null},
        },
        graduation: {
            completed: { type: Boolean, default: false },
            courseName: {type: String, default: null},
            startYear: {type : Number, default: null},
            endYear: {type : Number, default: null},
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            degree: {type: String, default: null},
            university: {type: String, default: null},
            collegeName: {type: String, default: null},
            specialization: {type: String, default: null},
        },
        postgraduation: {
            completed: { type: Boolean, default: false },
            courseName: {type: String, default: null},
            startYear: {type : Number, default: null},
            endYear: {type : Number, default: null},
            percentage: { type: Number, min: 0, max: 100 },
            cgpa: { type: Number, min: 0, max: 10 },
            degree: {type: String, default: null},
            university: {type: String, default: null},
            collegeName: {type: String, default: null},
            specialization: {type: String, default: null},
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



function isQualificationCompleted(level, data) {
  if (!data) return false;

  const rules = {
    tenth: ['startYear', 'endYear', 'percentage', 'cgpa', 'board', 'schoolName'],
    twelfth: ['startYear', 'endYear', 'percentage', 'cgpa', 'board', 'schoolName'],
    graduation: [
      'courseName','startYear','endYear','percentage','cgpa','degree','university','collegeName'],
    postgraduation: ['courseName','startYear','endYear','percentage','cgpa','degree','university','collegeName'],
  };

  return rules[level].every(field => data[field] != null);
}
// Helper function to check atleast one resume is uploaded
function hasAnyResume(resumes) {
  if (!resumes) return false;

  return Object.values(resumes).some(r => r !== null);
}
//helper function for qualification check based on highest qualification level
function areRequiredQualificationsCompleted(qualifications, highestQualification) {
  if (!qualifications || !highestQualification) return false;

  const order = ['tenth', 'twelfth', 'graduation', 'postgraduation'];

  const requiredLevels = order.slice(
    0,
    order.indexOf(highestQualification) + 1
  );

  return requiredLevels.every(
    level => qualifications[level]?.completed === true
  );
}
//helper function to check profileCompleted
function isProfileCompleted(user) {
  if (!user) return false;

  const basicChecks =
    user.emailVerified === true &&
    user.mobileVerified === true &&
    user.highestQualification != null &&
    hasAnyResume(user.resumes);

  if (!basicChecks) return false;

  return areRequiredQualificationsCompleted(
    user.qualifications,
    user.highestQualification
  );
}

userSchema.pre('save', function (next) {
    const watchedFields = [
  'emailVerified',
  'mobileVerified',
  'highestQualification',
  'resumes',
  'qualifications'
];
    if (!watchedFields.some(f => this.isModified(f))) {
    return next();
  }
  this.profileCompleted = isProfileCompleted(this);
  next();
});



userSchema.pre('save', function (next) {
    if (!this.isModified('qualifications')) return next();
  const q = this.qualifications;

  if (!q) return next();

  q.tenth.completed = isQualificationCompleted('tenth', q.tenth);
  q.twelfth.completed = isQualificationCompleted('twelfth', q.twelfth);
  q.graduation.completed = isQualificationCompleted('graduation', q.graduation);
  q.postgraduation.completed = isQualificationCompleted('postgraduation', q.postgraduation);

  next();
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