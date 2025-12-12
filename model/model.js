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
  linkedin: { type: DataTypes.JSON, allowNull: true },
  github: { type: DataTypes.JSON, allowNull: true },
  resume: { type: DataTypes.STRING, allowNull: true },
  social_media: { type: DataTypes.JSON, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  objective: { type: DataTypes.STRING, allowNull: true },
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
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: "/images/default.jpg",
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "organization",
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
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
    allowNull: true,
  },
  fax: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  facebookLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  title: {
    type: DataTypes.STRING,
  },
  openings: {
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
  expirey: {
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
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  jobType: {
    type: DataTypes.STRING,
  },
  remote: {
    type: DataTypes.STRING,
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
  cvUrl: {
    type: DataTypes.STRING,
  },
  coverLetter: {
    type: DataTypes.STRING,
    allowNull: true,
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


module.exports = {
  User,
  Organization,
  Job,
  VerificationCode,
  AppliedJobs,
  Contact,
  Admin,
};

// db.sync({ alter: true });
