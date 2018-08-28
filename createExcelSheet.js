var xl = require("excel4node");

var durationOfStatement = require(__dirname + "/durationOfStatement.js");
var createMonthSheets = durationOfStatement.createMonthSheets;

var populateMonthSheets = require(__dirname + "/populateMonthSheets.js");
var populateMonths = populateMonthSheets.populate;

var populateOverviewSheet = require(__dirname + "/populateOverviewSheet.js");
var populateOverview = populateOverviewSheet.populateOverview;
const create = input => {
  var wb = new xl.Workbook();

  expOverview = wb.addWorksheet("ExpOverview");
  incOverview = wb.addWorksheet("IncOverview");

  var numberStyle = wb.createStyle({
    font: {
      color: "#000000",
      size: 12
    },
    numberFormat: "#,##0.00; (#,##0.00); -"
  });

  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  var months = createMonthSheets(input.duration, months, wb);
  populateMonths(input.statement, months, numberStyle);
  populateOverview(months, expOverview, input.breakdown);
  wb.write("Finances.xlsx");
};

module.exports = {
  create: create
};
