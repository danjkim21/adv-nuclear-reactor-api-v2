const fs = require('fs');
const _ = require('lodash');

const { reactorDataOverview } = require('../db/data-overview');
const { reactorDataCore } = require('../db/data-core');
const { reactorDataGeneral } = require('../db/data-general');
const { reactorDataMaterial } = require('../db/data-material');
const { reactorDataNsss } = require('../db/data-nsss');
const { reactorDataRcs } = require('../db/data-rcs');
const { reactorDataRpv } = require('../db/data-rpv');

async function mergeData() {
  let reactorsList = _(reactorDataOverview)
    .concat(
      reactorDataCore,
      reactorDataGeneral,
      reactorDataMaterial,
      reactorDataNsss,
      reactorDataRcs,
      reactorDataRpv
    )
    .groupBy('name')
    .map(_.spread(_.merge))
    .value();

  // console.log(reactorsList);

  await fs.writeFile(
    './backend/db/data-merged.js',
    `exports.reactorDataMerged = ` + JSON.stringify(reactorsList, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Successfully merged data');
    }
  );

  console.log(`Merge completed. ${reactorsList.length} added`);
}

exports.mergeData = mergeData;
