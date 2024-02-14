const Reactor = require('../models/Reactor');

const insertToMongoDB = async (data) => {
  try {
    // Insert all merged data documents into Mongodb via Reactor Model
    await Reactor.insertMany(data);
    console.log('data inserted successfully');
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  insertToMongoDB,
};
