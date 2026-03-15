const fs = require("fs");
const path = require("path");

const samplePath = path.resolve(process.argv[2] || "data/mpp-read-sample.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assertHasKeys(label, object, keys) {
  const missingKeys = keys.filter((key) => !(key in object));
  if (missingKeys.length > 0) {
    fail(`${label} is missing keys: ${missingKeys.join(", ")}`);
  }
}

if (!fs.existsSync(samplePath)) {
  fail(`Sample file not found: ${samplePath}`);
}

const raw = fs.readFileSync(samplePath, "utf8").replace(/^\uFEFF/, "");
const sample = JSON.parse(raw);

if (!sample.taskCount || sample.taskCount < 1) {
  fail("Expected at least one task in the MPP sample.");
}

if (!sample.dependencyCount || sample.dependencyCount < 1) {
  fail("Expected at least one dependency in the MPP sample.");
}

if (!sample.firstTask) {
  fail("Expected firstTask in the MPP sample.");
}

if (!Array.isArray(sample.taskSample) || sample.taskSample.length === 0) {
  fail("Expected taskSample to contain at least one task.");
}

if (!Array.isArray(sample.dependencySample) || sample.dependencySample.length === 0) {
  fail("Expected dependencySample to contain at least one dependency.");
}

const expectedTaskKeys = ["id", "uniqueId", "wbs", "name", "summary", "startDate", "endDate"];
const expectedDependencyKeys = ["predecessorId", "successorId", "type", "lag", "lagFormat"];

assertHasKeys("firstTask", sample.firstTask, expectedTaskKeys);
assertHasKeys("taskSample[0]", sample.taskSample[0], expectedTaskKeys);
assertHasKeys("dependencySample[0]", sample.dependencySample[0], expectedDependencyKeys);

console.log("MPP read sample looks valid.");
console.log(`Source file: ${sample.sourceFile}`);
console.log(`Tasks: ${sample.taskCount}`);
console.log(`Dependencies: ${sample.dependencyCount}`);
console.log(`First task: ${sample.firstTask.id} - ${sample.firstTask.name}`);
console.log(
  `First dependency: ${sample.dependencySample[0].predecessorId} -> ${sample.dependencySample[0].successorId}`
);
