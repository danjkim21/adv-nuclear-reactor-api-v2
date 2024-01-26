import { InferSchemaType } from "mongoose";
const mongoose = require("mongoose");

const ReactorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    fullName: {
      type: String,
    },
    nameWebsite: {
      type: String,
    },
    designOrg: {
      type: String,
    },
    designOrgWebsite: {
      type: String,
    },
    coolant: {
      type: String,
    },
    moderator: {
      type: String,
    },
    designStatus: {
      type: String,
    },
    country: {
      type: String,
    },
    type: {
      type: String,
    },
    purpose: {
      type: String,
    },
    coreHeight: {
      type: String,
    },
    equivCoreDiameter: {
      type: String,
    },
    avgLinearHeatRate: {
      type: String,
    },
    avgFuelPowerDensity: {
      type: String,
    },
    avgCorePowerDensity: {
      type: String,
    },
    outerCoreDiameterFuelRods: {
      type: String,
    },
    rodArray: {
      type: String,
    },
    latticeGeometry: {
      type: String,
    },
    numOfFuelAssemblies: {
      type: String,
    },
    neutronSpectrum: {
      type: String,
    },
    thermalOutput: {
      type: String,
    },
    outputGross: {
      type: String,
    },
    outputNet: {
      type: String,
    },
    efficiency: {
      type: String,
    },
    thermodynamicCycle: {
      type: String,
    },
    nonElecApplications: {
      type: String,
    },
    fuelMaterial: {
      type: String,
    },
    claddingMaterial: {
      type: String,
    },
    reloadFuelEnrichment: {
      type: String,
    },
    fuelCycleLength: {
      type: String,
    },
    avgDischargeBurnup: {
      type: String,
    },
    burnableAbsorber: {
      type: String,
    },
    controlRodAbsorber: {
      type: String,
    },
    solubleNeutronAbsorber: {
      type: String,
    },
    steamFlowRate: {
      type: String,
    },
    steamPressure: {
      type: String,
    },
    steamTemp: {
      type: String,
    },
    feedWaterFlowRate: {
      type: String,
    },
    feedWaterTemp: {
      type: String,
    },
    primaryCoolantFlowRate: {
      type: String,
    },
    operatingPressure: {
      type: String,
    },
    coolantInletTemp: {
      type: String,
    },
    coolantOutletTemp: {
      type: String,
    },
    deltaTemp: {
      type: String,
    },
    innerDiameterCylindricalShell: {
      type: String,
    },
    wallThicknessCylindricalShell: {
      type: String,
    },
    baseMaterial: {
      type: String,
    },
    totHeightInside: {
      type: String,
    },
    transportWeight: {
      type: String,
    },
  },
  { timestamps: true }
);

export type ReactorType = InferSchemaType<typeof ReactorSchema>;

module.exports = mongoose.model("Reactor", ReactorSchema);
