const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");
const db = require("../connection.js");
const { type } = require("os");

// **MODELS
//USER MODEL------------------------------------------------------------------------------
const User = db.define("User", {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  skills: { type: DataTypes.JSON, allowNull: true },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: { type: DataTypes.STRING, allowNull: true },
  photo: {
    type: DataTypes.STRING,
    defaultValue: "/images/default.jpg",
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "jobseeker",
  },
  suspend: { type: DataTypes.BOOLEAN, defaultValue: false },
  code: { type: DataTypes.STRING, allowNull: true },
  otherDetails: { type: DataTypes.JSON, allowNull: true },
  experience: { type: DataTypes.JSON, allowNull: true },
  education: { type: DataTypes.JSON, allowNull: true },
  language: { type: DataTypes.JSON, allowNull: true },
  awards: { type: DataTypes.JSON, allowNull: true },
  certifications: { type: DataTypes.JSON, allowNull: true },
  resume: { type: DataTypes.BLOB, allowNull: true },
  social_media: { type: DataTypes.JSON, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.ENUM("Male", "Female", "Others"), allowNull: true },
});
//-------------------------------------------------------------------------------------------



//verification codes---------------------------------------------------------------------
const VerificationCode = db.define(
  "VerificationCode",
  {
    code: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "verification_codes" }
);
//----------------------------------------------------------------------------------------



//Organnization
const Organization = db.define("Organization", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  location: {
    type: DataTypes.STRING,
  },
  logo: {
    type: DataTypes.BLOB,
    defaultValue: "/images/default.jpg",
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "organization",
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rejected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  code: {
    type: DataTypes.STRING,
  },
  size: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  facebookLink: {
    type: DataTypes.STRING,
  },
  linkedin: {
    type: DataTypes.STRING,
  },
  contactPerson: {
    type: DataTypes.STRING,
  },
  contactPersonNum: {
    type: DataTypes.STRING,
  },
  info: {
    type: DataTypes.TEXT,
  },
  intro: {
    type: DataTypes.TEXT,
  },
});

const Admin = db.define("admin", {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: false,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
  },
  logo: {
    type: DataTypes.BLOB,
    defaultValue: "/images/default.jpg",
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  facebook: {
    type: DataTypes.TEXT,
  },
  linkedin: {
    type: DataTypes.TEXT,
  },
});

const Job = db.define("job", {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  companyName: {
    type: DataTypes.STRING,
  },
  title: {
    type: DataTypes.STRING,
  },
  noOfOpening: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  category: {
    type: DataTypes.STRING,
  },
  education: {
    type: DataTypes.STRING,
  },
  experience: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  expiryDate: {
    type: DataTypes.STRING,
  },
  salary: {
    type: DataTypes.STRING,
  },
  requiredskills: {
    type: DataTypes.JSON,
  },
  description: {
    type: DataTypes.TEXT,
  },
  requirements: {
    type: DataTypes.TEXT,
  },
  instruction: {
    type: DataTypes.TEXT,
  },
  banner: {
    type: DataTypes.STRING,
    defaultValue: "/images/default.jpg",
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  jobType: {
    type: DataTypes.STRING,
  },
  remoteOnsite: {
    type: DataTypes.STRING,
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
const AppliedJobs = db.define("appliedJobs", {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: false,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  applicationDate: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Accepted", "Rejected"),
    defaultValue: "Pending",
  },
  userId: {
    type: DataTypes.UUID,
  },
  cvUrl: {
    type: DataTypes.STRING,
  },
  coverLetter: {
    type: DataTypes.STRING,
  },
});

const SavedJobs = db.define("savedJobs", {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: false,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
});

const Contact = db.define("contact", {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: false,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  fullName: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  subject: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.TEXT,
  },
});

//user and applied jobs relation
User.hasMany(AppliedJobs);
AppliedJobs.belongsTo(User);

// job and applied-job
Job.hasMany(AppliedJobs);
AppliedJobs.belongsTo(Job);

//Organization and jobs relation
Organization.hasMany(Job);
Job.belongsTo(Organization);

Organization.hasMany(AppliedJobs);
AppliedJobs.belongsTo(Organization);

User.hasMany(SavedJobs);
SavedJobs.belongsTo(User);

module.exports = {
  User,
  Organization,
  Job,
  VerificationCode,
  AppliedJobs,
  SavedJobs,
  Contact,
  Admin,
};

// db.sync({ alter: true });
