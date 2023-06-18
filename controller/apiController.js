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
  // path '/api/categories'
  // GETS the adv. reactors API - returns all unique reactor types
  getReactorTypes: async (req, res) => {
    try {
      const reactorDataAll = await Reactor.find();

      // Array of all unique reactor.type values
      const reactorCategories = [];
      const typeSet = new Set();

      for (const reactor of reactorDataAll) {
        const type = reactor.type;
        if (!typeSet.has(type)) {
          typeSet.add(type);
          reactorCategories.push(type);
        }
      }

      res.json(reactorCategories);
    } catch (err) {
      res.status(404).end();
    }
  },
  // path '/api/categories/:type'
  // GETS the adv. reactors API - returns all unique reactor types
  getReactorsByType: async (req, res) => {
    const typeInput = req.params.type.replace(/%20/g, ' ');
    console.log(`Entered: ${typeInput}`);
    try {
      if (typeInput === 'ALL') {
        const reactorDataAll = await Reactor.find();
        res.json(reactorDataAll);
      }

      const reactorsByType = await Reactor.find()
        .where('type')
        .equals(typeInput);

      res.json(reactorsByType);
    } catch (err) {
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
