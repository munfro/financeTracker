var xl = require("excel4node");

var layout = require(__dirname + "/overviewSheetLayout.json");
var fields = require(__dirname + "/trialStatement/fields.json");

const populateOverview = (months, overview, breakdown) => {
  populateTopRows(months, overview, layout);

  incTypes = [];
  expTypes = [];
  fields.map(function(value) {
    if (value.IncExp == "Inc") {
      incTypes.push(value.Type);
    } else {
      expTypes.push(value.Type);
    }
  });
  incTypes = removeDuplicateUsingFilter(incTypes);
  expTypes = removeDuplicateUsingFilter(expTypes);

  populateExpTypesOverall(expTypes, breakdown, layout, overview, months);
};

function removeDuplicateUsingFilter(arr) {
  let unique_array = arr.filter(function(elem, index, self) {
    return index == self.indexOf(elem);
  });
  return unique_array;
}

const populateTopRows = (months, overview, layout) => {
  yearCellRow = xl.getExcelRowCol(layout.firstYearCell).row;
  yearCellCol = xl.getExcelRowCol(layout.firstYearCell).col;
  months.map(function(value, key) {
    if (key == 0 || value.year != months[key - 1].year) {
      overview.cell(yearCellRow, yearCellCol + key).number(value.year);
    }
    overview.cell(yearCellRow + 1, yearCellCol + key).string(value.month);
  });
};

const populateExpTypesOverall = (
  expTypes,
  breakdown,
  layout,
  overview,
  months
) => {
  expenditureRow = xl.getExcelRowCol(layout.expenditureCell).row;
  expenditureCol = xl.getExcelRowCol(layout.expenditureCell).col;
  overview.cell(expenditureRow, expenditureCol).string("Expenditure");

  var baseRow = expenditureRow + expTypes.length + 4;
  overview
    .cell(expenditureRow + expTypes.length + 1, expenditureCol)
    .string("Other");
  var row = baseRow;

  expTypes.map(function(value, key) {
    overview.cell(row, expenditureCol).string(value);
    typeRow = expenditureRow + key + 1;
    overview.cell(typeRow, expenditureCol).string(value);

    row = row + 1;
    //filters for category/type of transaction being added
    z = breakdown.filter(function(val) {
      return value == val.Type;
    });
    //console.log(z.length);
    //console.log(z[0].monthlySpend);
    overview.cell(row, expenditureCol).string(value);
    firstRow = row;
    //console.log(z.length);
    //maps monthly spending of each payee, putting each in row by row
    z.map(function(val) {
      //if (key < 1 && keyz < 1) {
      //console.log(val.monthlySpend);
      if (val.monthlySpend) {
        val.monthlySpend.map(function(monthVal, keys) {
          var x = months.findIndex(function(obj) {
            return obj.numString == monthVal.monthYear;
          });
          overview.cell(row, expenditureCol + 1 + x).number(monthVal.monthTot);
          colLetter = xl.getExcelAlpha(expenditureCol + 1 + x);

          lastRow = firstRow + z.length - 1;
          overview
            .cell(typeRow, expenditureCol + 1 + x)
            .formula(
              "SUM(" + colLetter + firstRow + ":" + colLetter + lastRow + ")"
            );
        });
        //console.log(months[0].numString);
        //}
        overview.cell(row, expenditureCol).string(val.Payee);
        row = row + 1;
      }
    });
    lastRow = row;
    row = row + 1;
  });
  //console.log(expTypes);
};

module.exports = {
  populateOverview: populateOverview,
  removeDuplicateUsingFilter: removeDuplicateUsingFilter
};
