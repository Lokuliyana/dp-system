const mongoose = require('mongoose');
const Exam = require('./src/models/student/exam.model');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');

async function test() {
  await connectDB();
  try {
    const payload = {
      nameSi: "1 ශ්රේණිය",
      nameEn: "Grade 1",
      date: "2026-02-18T19:27:59.719Z",
      type: "SRIANANDA",
      gradeIds: ["698770d7fe940d07db0fbfe1","698770e4fe940d07db0fbff2","698770f1fe940d07db0fc003","698770fffe940d07db0fc014","6987710efe940d07db0fc025","6987713efe940d07db0fc048","69877152fe940d07db0fc059","6987716cfe940d07db0fc06a","69877177fe940d07db0fc07b","698771affe940d07db0fc0a4","698771d3fe940d07db0fc0b5","698771eafe940d07db0fc0c6","69877208fe940d07db0fc0d7","6987721bfe940d07db0fc0e9"],
      year: 2026,
      schoolId: "67b4504df002d08a0d0bc5d9", // Dummy but valid format
      createdById: "67b4504df002d08a0d0bc5d9"
    };
    
    console.log('Attempting to create exam...');
    const exam = await Exam.create(payload);
    console.log('Exam created successfully:', exam._id);
  } catch (err) {
    console.error('Error creating exam:');
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

test();
