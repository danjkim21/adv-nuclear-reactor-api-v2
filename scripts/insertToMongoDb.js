const Reactor = require('../models/Reactor');

// Insert all merged data documents into Mongodb via Reactor Model
const insertToMongoDB = async (data) => {
  try {
    await upsertMany(data);
    console.log('data inserted successfully');
  } catch (err) {
    console.error(err);
  }
};

// Helper func - takes array of docs and uses updateOne mongoose function to either insert unique doc to db or update if doc name already exists
async function upsertMany(documents) {
  const operations = documents.map((doc) => ({
    updateOne: {
      filter: { name: doc.name },
      update: doc,
      upsert: true,
    },
  }));
  const result = await Reactor.bulkWrite(operations);
  return result;
}

module.exports = {
  insertToMongoDB,
};
