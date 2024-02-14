const fs = require('fs');
const _ = require('lodash-core');

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
    './db/data-merged.js',
    `exports.reactorDataMerged = ` + JSON.stringify(reactorsList, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(
        `Merge completed. ${reactorsList.length} added to data-merged.js`
      );
    }
  );
}

exports.mergeData = mergeData;
