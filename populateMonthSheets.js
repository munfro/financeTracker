var xl = require("excel4node");

var layout = require(__dirname + "/monthSheetLayout.json");

const populate = (statement, months, style) => {
  months.map(function(valueM, key) {
    var z = statement.filter(function(valueF) {
      return valueF.monthYear == valueM.numString;
    });
    sheet = valueM.sheet;

    z.map(function(value, key) {
      sheet.cell(key + 2, layout.payeeColumn).string(value.field2);
      sheet.cell(key + 2, layout.dateColumn).string(value.field1);
      if (value.amount > 0) {
        sheet
          .cell(key + 2, layout.incomeColumn)
          .number(Number(value.amount))
          .style(style);
      } else {
        sheet
          .cell(key + 2, layout.expenditureColumn)
          .number(Number(value.amount))
          .style(style);
      }
      if (value.accounted) {
        sheet.cell(key + 2, layout.accountedColumn).string("Y");
      }
    });
    finalRow = z.length + 1;
    sums(layout, finalRow, sheet, style);
  });
};

const sums = (layout, finalRow, sheet, style) => {
  topLletter = xl.getExcelRowCol(layout.netTableTopLeft).col;
  topLnum = xl.getExcelRowCol(layout.netTableTopLeft).row;

  sheet.cell(topLnum, topLletter).string("Income");
  sheet.cell(topLnum + 1, topLletter).string("Expenditure");
  sheet.cell(topLnum + 2, topLletter).string("Net");
  sheet
    .cell(topLnum + 1, topLletter + 1)
    .formula(
      "SUM(" +
        xl.getExcelAlpha(layout.expenditureColumn) +
        "2:" +
        xl.getExcelAlpha(layout.expenditureColumn) +
        finalRow +
        ")"
    )
    .style(style);
  sheet
    .cell(topLnum, topLletter + 1)
    .formula(
      "SUM(" +
        xl.getExcelAlpha(layout.incomeColumn) +
        "2:" +
        xl.getExcelAlpha(layout.incomeColumn) +
        finalRow +
        ")"
    )
    .style(style);
  sheet
    .cell(topLnum + 2, topLletter + 1)
    .formula(
      xl.getExcelCellRef(3, topLletter + 1) +
        "+" +
        xl.getExcelCellRef(topLnum + 1, topLletter + 1)
    )
    .style(style);
};
module.exports = {
  populate: populate
};
