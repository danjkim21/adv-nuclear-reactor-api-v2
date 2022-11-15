const { reactorDataMerged } = require('../db/data-merged');

// path '/api/'
// GETS the adv. reactors API - Not filtered
const getAllReactorData = (req, res) => {
  res.json(reactorDataMerged);
};

// path '/api/:name'
// GETS the adv. reactors API - filtered by NAME
const getReactor = (req, res) => {
  const reactorName = req.params.name.toLowerCase();
  console.log(`Entered: ${reactorName}`);

  if (
    reactorDataMerged.filter(
      (elem) => elem.name.toLowerCase() === reactorName.toLowerCase()
    )
  ) {
    res.json(
      reactorDataMerged.filter(
        (elem) => elem.name.toLowerCase() === reactorName.toLowerCase()
      )
    );
  } else {
    res.status(404).end();
  }
};

module.exports = { getAllReactorData, getReactor };
