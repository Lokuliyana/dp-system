const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const Competition = require('./src/models/competition.model');
    const indexes = await Competition.collection.indexes();
    console.log('Indexes:', JSON.stringify(indexes, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
