var xl = require("excel4node");

var layout = require(__dirname + "/overviewSheetLayout.json");
var fields = require(__dirname + "/fields.json");

const populateOverview = (months, overview, breakdown) => {
  populateTopRows(months, overview, layout);

  types = breakdown.map(function(value) {
    return value.Type;
  });
  types = removeDuplicateUsingFilter(types);

  populateTypes(types, breakdown, layout, overview, months);
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

const populateTypes = (types, breakdown, layout, overview, months) => {
  expenditureRow = xl.getExcelRowCol(layout.expenditureCell).row;
  expenditureCol = xl.getExcelRowCol(layout.expenditureCell).col;

  var baseRow = expenditureRow + types.length + 3;

  var row = baseRow;

  types.map(function(value, key) {
    overview.cell(row, expenditureCol).string(value);
    typeRow = expenditureRow + key;
    overview.cell(typeRow, expenditureCol).string(value);

    row = row + 1;
    //filters for category/type of transaction being added
    breakdownType = breakdown.filter(function(val) {
      return value == val.Type;
    });
    //console.log(breakdownType);
    //console.log(breakdownType.length);
    //console.log(breakdownType[0].monthlyInc);
    overview.cell(row, expenditureCol).string(value);
    firstRow = row;
    //console.log(breakdownType.length);
    //maps monthly spending of each payee, putting each in row by row
    breakdownType.map(function(val, keyz) {
      //if (key < 1 && keyz < 1) {
      //console.log(val);
      //console.log(val.monthlyInc);
      if (val.monthlyInc) {
        val.monthlyInc.map(function(monthVal, keys) {
          var x = months.findIndex(function(obj) {
            return obj.numString == monthVal.date;
          });
          overview.cell(row, expenditureCol + 1 + x).number(monthVal.amount);
          colLetter = xl.getExcelAlpha(expenditureCol + 1 + x);

          lastRow = firstRow + breakdownType.length - 1;
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
  //console.log(types);
};

module.exports = {
  populateOverview: populateOverview,
  removeDuplicateUsingFilter: removeDuplicateUsingFilter
};
