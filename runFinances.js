var CSVload = require(__dirname + "/CSVload.js");
var runCSV = CSVload.runCSV;
var createExcelSheet = require(__dirname + "/createExcelSheet.js");
var create = createExcelSheet.create;
var fields = require(__dirname + "/trialStatement/fields.json");

var statement = __dirname + "/trialStatement/oldStatement.csv";
//var fields = __dirname + "/trialStatement/fields.csv";

async function runFinances() {
  var result = await runCSV(statement, fields);
  create(result);
}

runFinances();
