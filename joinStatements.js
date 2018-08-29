const d3 = require("d3");
const fs = require("fs");
const _ = require("lodash");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const process = name => {
  var raw = fs.readFileSync(`trialStatement/allStatements/${name}`, "utf8");
  raw = "row1,row2,row3\n" + raw.substring(1, raw.length);
  var csv = d3.csvParse(raw);

  var db = db.concat(csv);
};

var files = fs.readdirSync(`${__dirname}/trialStatement/allStatements`);
var db = [];
files.map(function(value) {
  if (value.indexOf("csv") > 0) {
    var raw = fs.readFileSync(`trialStatement/allStatements/${value}`, "utf8");

    raw = "row1,row2,row3\n" + raw.substring(1, raw.length);
    var csv = d3.csvParse(raw);
    //console.log(csv[csv.length]);
    //var newCSV = [];
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
//console.log(db);
//_.each(files, filename => process(filename));
/*db.map(function(value) {
  z = db.filter(function(filt) {
    if (
      value.row1 == filt.row1 &&
      value.row2 == filt.row2 &&
      value.row3 == filt.row3
    ) {
      return value;
    }
  });
  if (z.length > 2) {
    console.log(z);
  }
});*/

const csvWriter = createCsvWriter({
  path: __dirname + "/trialStatement/allStatements.csv",
  header: [
    { id: "row1", title: "field1" },
    { id: "row2", title: "field2" },
    { id: "row3", title: "field3" }
  ]
});

const records = [
  { name: "Bob", lang: "French, English" },
  { name: "Mary", lang: "English" }
];

csvWriter
  .writeRecords(db) // returns a promise
  .then(() => {
    console.log("...Done");
  });
