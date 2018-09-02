const d3 = require("d3");
const fs = require("fs");
const _ = require("lodash");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const config = require(__dirname + "/config.json");

var files = fs.readdirSync(config.unjoinedStatementFolder);
var db = [];

files.map(function(value) {
  if (value.indexOf("csv") > 0) {
    var raw = fs.readFileSync(
      config.unjoinedStatementFolder + `/${value}`,
      "utf8"
    );

    raw = "row1,row2,row3\n" + raw.substring(1, raw.length);
    var csv = d3.csvParse(raw);
    var newCSV = csv.map(function(value) {
      db.filter(function(val) {
        if (
          val.row1 == value.row1 &&
          val.row2 == value.row2 &&
          val.row3 == value.row3
        ) {
          //console.log("match");
          value.doubleCount = 1;
        }
      });
      return value;
    });
    newCSV = newCSV.filter(function(value) {
      return value.doubleCount != 1;
    });
    db = db.concat(newCSV);
  }
});

const csvWriter = createCsvWriter({
  path:
    config.statementFolderPath +
    config.statementName +
    String(Date().substring())
      .replace(/ /g, "-")
      .substring(4, 15) +
    ".csv",
  header: [
    { id: "row1", title: "field1" },
    { id: "row2", title: "field2" },
    { id: "row3", title: "field3" }
  ]
});

csvWriter
  .writeRecords(db) // returns a promise
  .then(() => {
    console.log("...Done");
  });

const csvWriter1 = createCsvWriter({
  path: config.statementFolderPath + config.statementName + ".csv",
  header: [
    { id: "row1", title: "field1" },
    { id: "row2", title: "field2" },
    { id: "row3", title: "field3" }
  ]
});

csvWriter1
  .writeRecords(db) // returns a promise
  .then(() => {
    console.log("...Done");
  });
