const createMonthSheets = (duration, months, wb) => {
  monthArray = createMonthArray(duration, months);
  monthArray = monthArray.map(function(value, key) {
    value.sheet = wb.addWorksheet(value.textString);
    formatMonthSheet(value.sheet);
    //overview.cell(1, key + 2).string(value.month);
    return value;
  });
  return monthArray;
};

const createMonthArray = (duration, months) => {
  //duration = ["2018-01", "2019-07"];

  firstYear = Number(duration[0].substring(0, 4));
  lastYear = Number(duration[1].substring(0, 4));
  firstMonth = Number(duration[0].substring(5, 7));
  lastMonth = Number(duration[1].substring(5, 7));

  month = firstMonth;
  year = firstYear;
  array = new Array(
    (lastYear - firstYear) * 12 + lastMonth - firstMonth + 1
  ).fill(0);
  array = array.map(function(value) {
    monthString =
      months[month - 1].substring(0, 3) + String(year).substring(2, 4);
    output = {
      numString: monthYearMaker(month, year),
      textString: monthString,
      month: months[month - 1],
      year: year
    };
    month = month + 1;
    if (month > 12) {
      month = 1;
      year = year + 1;
    }
    return output;
  });
  return array;
};

const monthYearMaker = (month, year) => {
  if (month < 10) {
    return year + "-0" + month;
  } else {
    return year + "-" + month;
  }
};

const formatMonthSheet = sheet => {
  sheet.cell(1, 1).string("Transaction");
  sheet.cell(1, 2).string("Date");
  sheet.cell(1, 3).string("Expenditure");
  sheet.cell(1, 4).string("Income");
  sheet.cell(1, 5).string("Account");
};
module.exports = {
  createMonthSheets: createMonthSheets
};
