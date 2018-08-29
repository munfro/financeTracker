var fs = require("fs");
var csv = require("csvtojson");

var excelSheet = require(__dirname + "/populateOverviewSheet.js");
var removeDuplicateUsingFilter = excelSheet.removeDuplicateUsingFilter;
var statement = __dirname + "/trialStatement/oldStatement.csv";
//var fields = __dirname + "/trialStatement/fields.csv";
var fields = require(__dirname + "/trialStatement/fields.json");

const runCSV = (statement, fields) => {
  return new Promise(function(res, rej) {
    csv({
      noheader: false
    })
      .fromFile(statement)
      .then(statementCSV => {
        var duration = statementDuration(statementCSV);
        var breakdownInc = [];
        var breakdownExp = [];
        var subTypes = [];
        var subTypesTransactions = [];

        fields.map(function(value, key) {
          if (value.subType) {
            subTypes.push(value.subType);
            subType = removeDuplicateUsingFilter(subTypes);

            transac = statementCSV.filter(function(CSV) {
              CSV.monthYear = monthYearString(CSV.field1);
              if (
                CSV.field2.toUpperCase().indexOf(value.Payee.toUpperCase()) >= 0
              ) {
                CSV.accounted = 1;
                CSV.amount = Number(CSV.field3.replace(/,/g, ""));

                return CSV;
              }
            });
            if (!subTypesTransactions[0]) {
              subTypesTransactions.push({
                subType: value.subType,
                Type: value.Type,
                transactions: transac
              });
            } else {
              var next = 0;
              subTypesTransactions.map(function(subType, subKey) {
                if (value.subType == subType.subType) {
                  subType.transactions = subType.transactions.concat(transac);
                  next = 1;
                } else {
                  if (subKey == subTypesTransactions.length - 1 && !next) {
                    subTypesTransactions.push({
                      subType: value.subType,
                      Type: value.Type,
                      transactions: transac
                    });
                    next = 0;
                  }
                }
              });
            }
          } else {
            expenditure = [];
            income = statementCSV.filter(function(CSV) {
              payee = CSV.field2.substring(0, CSV.field2.indexOf("  "));
              if (
                CSV.field2.toUpperCase().indexOf(value.Payee.toUpperCase()) >= 0
              ) {
                CSV.accounted = 1;
                CSV.amount = Number(CSV.field3.replace(/,/g, ""));
                if (CSV.amount > 0) {
                  return CSV;
                } else {
                  expenditure.push(CSV);
                }
              }
            });
            //if (key == 26) {
            //console.log(value.Payee);
            //console.log(expenditure);
            monthlyInc = createMonthlySpend(income);
            monthlyExp = createMonthlySpend(expenditure);

            breakdownInc = breakdownPush(
              monthlyInc,
              value.Payee,
              value.Type,
              breakdownInc
            );

            breakdownExp = breakdownPush(
              monthlyExp,
              value.Payee,
              value.Type,
              breakdownExp
            );
          }
          //}
        });
        //console.log(subTypesTransactions[0]);
        subTypesTransactions.map(function(value, jj) {
          //console.log(value.subType);
          expenditure = [];
          income = value.transactions.filter(function(val) {
            if (val.amount > 0) {
              return val;
            } else {
              expenditure.push(val);
            }
          });
          monthlyInc = createMonthlySpend(income);
          monthlyExp = createMonthlySpend(expenditure);

          breakdownInc = breakdownPush(
            monthlyInc,
            value.subType,
            value.Type,
            breakdownInc
          );
          breakdownExp = breakdownPush(
            monthlyExp,
            value.subType,
            value.Type,
            breakdownExp
          );
        });
        otherExp = statementCSV.filter(function(value) {
          value.amount = Number(value.field3.replace(/,/g, ""));
          return !value.accounted && Number(value.field3) < 0;
        });
        otherInc = statementCSV.filter(function(value) {
          value.amount = Number(value.field3.replace(/,/g, ""));
          return !value.accounted && Number(value.field3) > 0;
        });
        otherIncMonthly = createMonthlySpend(otherInc);
        otherExpMonthly = createMonthlySpend(otherExp);
        breakdownInc.push({
          Payee: "Other",
          Type: "Other",
          monthlyInc: otherIncMonthly.monthly,
          totalInc: otherIncMonthly.totalSpend
        });
        breakdownExp.push({
          Payee: "Other",
          Type: "Other",
          monthlyInc: otherExpMonthly.monthly,
          totalInc: otherExpMonthly.totalSpend
        });

        res({
          duration: duration,
          statement: statementCSV,
          breakdownInc: breakdownInc,
          breakdownExp: breakdownExp
        });
      });
    //});
  });
};

const createMonthlySpend = input => {
  dateSorted = input.sort(date_sort);
  monthly = [];
  if (dateSorted.length) {
    dateSorted.map(function(value, key) {
      if (key == 0) {
        monthlySpend = value.amount;
        currentMonth = monthYearString(value.field1);
        totalSpend = monthlySpend;
        monthly = finalMonthPush(
          currentMonth,
          monthlySpend,
          key,
          dateSorted,
          monthly
        );
      } else {
        nextMonth = monthYearString(value.field1);
        totalSpend = totalSpend + value.amount;
        if (currentMonth == nextMonth) {
          monthlySpend = monthlySpend + value.amount;
          monthly = finalMonthPush(
            currentMonth,
            monthlySpend,
            key,
            dateSorted,
            monthly
          );
        } else {
          monthly.push({ date: currentMonth, amount: monthlySpend });
          currentMonth = nextMonth;
          monthlySpend = value.amount;
          monthly = finalMonthPush(
            currentMonth,
            monthlySpend,
            key,
            dateSorted,
            monthly
          );
        }
      }
    });
    return { monthly: monthly, totalSpend: totalSpend };
  } else {
    return { monthly: [], totalSpend: Number(0) };
  }
};

const date_sort = (value1, value2) => {
  var date1 = makeDate(value1.field1);
  var date2 = makeDate(value2.field1);
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};

const makeDate = value => {
  var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
  return new Date(value.replace(pattern, "$3-$2-$1"));
};

const monthYearString = input => {
  return input.substring(6, 10) + "-" + input.substring(3, 5);
};

const finalMonthPush = (
  currentMonth,
  monthlySpend,
  key,
  dateSorted,
  monthly
) => {
  if (key == dateSorted.length - 1) {
    monthly.push({ date: currentMonth, amount: monthlySpend });
  }
  return monthly;
};

const breakdownPush = (monthly, payee, type, breakdown) => {
  if (monthly.totalSpend != 0) {
    breakdown.push({
      Payee: payee,
      Type: type,
      monthlyInc: monthly.monthly,
      totalInc: monthly.totalSpend
    });
  }
  return breakdown;
};
const monthlySpendPush = (field, ammount) => {
  return { monthYear: monthYearString(field), monthTot: ammount };
};

//finds the duration the statements run for to create the spreadsheet
const statementDuration = input => {
  var first = monthYearString(input[input.length - 1].field1);
  var last = monthYearString(input[0].field1);
  //console.log(first);
  //console.log(last);
  return [first, last];
};

module.exports = {
  runCSV: runCSV
};
