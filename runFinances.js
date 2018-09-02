var CSVload = require(__dirname + "/CSVload.js");
var runCSV = CSVload.runCSV;
var createExcelSheet = require(__dirname + "/createExcelSheet.js");
var create = createExcelSheet.create;

var fields = require(__dirname + "/fields.json");
var config = require(__dirname + "/config.json");
var statement = config.statementFolderPath + config.statementName + ".csv";

async function runFinances(statement, fields) {
  var result = await runCSV(statement, fields);
  create(result);
}

runFinances(statement, fields);
