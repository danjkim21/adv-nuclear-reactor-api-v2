const Reactor = require('../models/Reactor');

module.exports = {
  // path '/api/'
  // GETS the adv. reactors API - Not filtered
  getAllReactorData: async (req, res) => {
    try {
      const reactorDataAll = await Reactor.find();
      const reactorCountAll = await Reactor.countDocuments();
      console.log(`Data Availability: ${reactorCountAll} reactors`);
      res.json(reactorDataAll);
    } catch (err) {
      console.error(err);
      res.status(404).end();
    }
  },
  // path '/api/:name'
  // GETS the adv. reactors API - filtered by NAME
  getReactor: async (req, res) => {
    const reactorName = req.params.name;
    console.log(`Entered: ${reactorName}`);
    try {
      const reactorDataOne = await Reactor.findOne({
        name: reactorName,
      }).collation({
        // collation for case Insensitive Indexing
        locale: 'en',
        strength: 2,
      });
      console.log(reactorDataOne.name);
      res.json(reactorDataOne);
    } catch (err) {
      console.error(err);
      res.status(404).end();
    }
  },
};
