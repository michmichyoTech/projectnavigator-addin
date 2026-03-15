const fs = require("fs");
const path = require("path");

const checklistPath = path.resolve("data/mpp-task-field-checklist.md");
const outputPath = path.resolve("data/mpp-selected-task-fields.json");

const checklist = fs.readFileSync(checklistPath, "utf8");
const lines = checklist.split(/\r?\n/);

const coreFields = [];
const taskPropertyFields = [];
let section = "";

for (const line of lines) {
  if (line.startsWith("## ")) {
    section = line.replace(/^##\s+/, "").trim();
    continue;
  }

  const match = line.match(/^- \[(x|X)\] (.+)$/);
  if (!match) {
    continue;
  }

  const label = match[2].trim();
  const fieldName = label.replace(/\s+\([^)]+\)$/, "");

  if (section === "Core Export Fields") {
    coreFields.push(fieldName);
    continue;
  }

  if (section === "Available MS Project Task Properties") {
    taskPropertyFields.push(fieldName);
  }
}

const selectedFieldMap = {
  generatedFrom: "data/mpp-task-field-checklist.md",
  generatedAt: new Date().toISOString(),
  coreFields,
  taskPropertyFields: taskPropertyFields.filter((fieldName) => !coreFields.includes(fieldName))
};

fs.writeFileSync(outputPath, `${JSON.stringify(selectedFieldMap, null, 2)}\n`, "utf8");
console.log(outputPath);
