const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

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
    firstNameSi: { type: String, trim: true },
    lastNameSi: { type: String, trim: true },
    fullNameSi: { type: String, trim: true },

    firstNameEn: { type: String, required: true, trim: true },
    lastNameEn: { type: String, required: true, trim: true },
    fullNameEn: { type: String, trim: true },

    admissionNumber: { type: String, required: true, trim: true },
    admissionDate: { type: Date, required: true },
    dob: { type: Date, required: true },

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

    email: { type: String, trim: true, lowercase: true },
    phoneNum: { type: String, trim: true },
    addressSi: { type: String, trim: true },
    addressEn: { type: String, trim: true },

    emergencyContacts: { type: [emergencyContactSchema], default: [] },
    notes: { type: [studentNoteSchema], default: [] },

    academicYear: { type: Number, index: true },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true })

studentSchema.pre('save', async function setFullNames() {
  this.fullNameEn = `${this.firstNameEn} ${this.lastNameEn}`.trim()
  if (this.firstNameSi || this.lastNameSi) {
    this.fullNameSi = `${this.firstNameSi || ''} ${this.lastNameSi || ''}`.trim()
  }
})

module.exports = mongoose.model('Student', studentSchema)
