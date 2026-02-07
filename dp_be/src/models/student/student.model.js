const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const emergencyContactSchema = new mongoose.Schema(
  {
    nameSi: { type: String, trim: true },
    nameEn: { type: String, trim: true },
    relationshipSi: { type: String, trim: true },
    relationshipEn: { type: String, trim: true },
    number: { type: String, trim: true },
  },
  { _id: false }
)

const studentNoteSchema = new mongoose.Schema(
  {
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppUser',
      required: true,
    },
    category: {
      type: String,
      enum: ['academic', 'behaviour', 'achievement', 'health', 'other'],
      default: 'other',
    },
    content: { type: String, required: true, trim: true },
    notedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const studentSchema = new mongoose.Schema(
  {
    // --- Names ---
    firstNameSi: { type: String, required: true, trim: true },
    lastNameSi: { type: String, required: true, trim: true },
    fullNameSi: { type: String, required: true, trim: true },
    nameWithInitialsSi: { type: String, required: true, trim: true },

    firstNameEn: { type: String, trim: true }, // Not strictly mandatory per user list, but usually needed
    lastNameEn: { type: String, trim: true },
    fullNameEn: { type: String, required: true, trim: true },

    // --- Personal Details ---
    admissionNumber: { type: String, required: true, trim: true },
    admissionDate: { type: Date, required: true },
    admissionYear: { type: Number, required: true, index: true },
    dob: { type: Date, required: true },
    sex: { type: String, enum: ['male', 'female'], required: true },
    birthCertificateNumber: { type: String, trim: true },

    // --- Academic ---
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      index: true,
    },
    admittedGrade: { type: String, trim: true }, // The grade they were admitted to
    medium: { type: String, enum: ['sinhala', 'english', 'tamil'], default: 'sinhala' },
    academicYear: { type: Number, index: true },

    // --- Contact ---
    addressSi: { type: String, trim: true },
    addressEn: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phoneNum: { type: String, trim: true }, // General phone
    whatsappNumber: { type: String, trim: true },
    emergencyNumber: { type: String, trim: true },

    // --- Parent Details ---
    motherNameEn: { type: String, trim: true },
    motherNumber: { type: String, trim: true },
    motherOccupation: { type: String, trim: true },

    fatherNameEn: { type: String, trim: true },
    fatherNumber: { type: String, trim: true },
    fatherOccupation: { type: String, trim: true },

    // --- Legacy / Extra ---
    emergencyContacts: { type: [emergencyContactSchema], default: [] },
    notes: { type: [studentNoteSchema], default: [] },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },

    present: { type: Boolean, default: true, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    activeNote: { type: String, trim: true },
    inactiveNote: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
  },
  baseSchemaOptions
)

studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true })

studentSchema.pre('save', async function setFullNames() {
  // Only set fullNameEn from parts if it's not already set
  if (!this.fullNameEn && this.firstNameEn && this.lastNameEn) {
    this.fullNameEn = `${this.firstNameEn} ${this.lastNameEn}`.trim()
  }

  // Only set fullNameSi from parts if it's not already set
  if (!this.fullNameSi && this.firstNameSi && this.lastNameSi) {
    this.fullNameSi = `${this.firstNameSi} ${this.lastNameSi}`.trim()
  }
})

module.exports = mongoose.model('Student', studentSchema)
