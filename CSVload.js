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
      noheader: true
    })
      .fromFile(statement)
      .then(statementCSV => {
        var duration = statementDuration(statementCSV);
        var breakdown = [];
        var subTypes = [];
        var subTypesTransactions = [];

        fields.map(function(value, key) {
          if (value.subType) {
            subTypes.push(value.subType);
            subType = removeDuplicateUsingFilter(subTypes);

            transac = statementCSV.filter(function(CSV) {
              if (
                CSV.field2.toUpperCase().indexOf(value.Payee.toUpperCase()) >= 0
              ) {
                CSV.accounted = 1;
                return CSV;
              }
            });
            //console.log(value.subType);
            if (!subTypesTransactions[0]) {
              subTypesTransactions.push({
                subType: value.subType,
                Type: value.Type,
                transactions: transac
              });
            } else {
              subTypesTransactions.map(function(subType, subKey) {
                if (value.subType == subType.subType) {
                  console.log(value.subType);
                  subType.transactions = subType.transactions.concat(transac);
                } else {
                  //console.log(value.subType);
                  if (subKey == subTypesTransactions.length - 1) {
                    subTypesTransactions.push({
                      subType: value.subType,
                      Type: value.Type,
                      transactions: transac
                    });
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
            //console.log(monthlyInc);
            //console.log(monthlyExp);
            breakdown.push({
              Payee: value.Payee,
              Type: value.Type,
              monthlyInc: monthlyInc.monthly,
              totalInc: monthlyInc.totalSpend,
              monthlyExp: monthlyExp.monthly,
              totalExp: monthlyExp.totalSpend
            });
          }
          //}
        });
        //console.log(subTypesTransactions[0]);
        subTypesTransactions.map(function(value) {
          //console.log(value.subType);
          expenditure = [];
          income = value.transactions.filter(function(val) {
            if (val > 0) {
              return val;
            } else {
              expenditure.push(val);
            }
          });
          monthlyInc = createMonthlySpend(income);
          monthlyExp = createMonthlySpend(expenditure);

          breakdown.push({
            Payee: value.subType,
            Type: value.Type,
            monthlyInc: monthlyInc.monthly,
            totalInc: monthlyInc.totalSpend,
            monthlyExp: monthlyExp.monthly,
            totalExp: monthlyExp.totalSpend
          });
        });

        //console.log(breakdown);
        otherExp = statementCSV.filter(function(value) {
          return !value.accounted && Number(value.field3) < 0;
        });
        otherInc = statementCSV.filter(function(value) {
          return !value.accounted && Number(value.field3) > 0;
        });
        //console.log(breakdown[breakdown.length - 1]);
        /*res({
          breakdown: breakdown,
          duration: duration,
          statement: statementCSV
        });*/
        //console.log(subTypes);
        subTypes = removeDuplicateUsingFilter(subTypes);
        //console.log(subTypes);
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

//var x = runCSV(statement, fields);

const otherSort = (input, amount, totalSpend, value) => {
  if (input.length) {
    var key = input.length - 1;
    var monthYear = monthYearString(value.field1);

    if (input[key].monthYear == monthYear) {
      input[key].monthTot = input[key].monthTot + amount;
    } else {
      input.push(monthlySpendPush(value.field1, ammount));
    }
  } else {
    input.push(monthlySpendPush(value.field1, ammount));
  }
  return (totalSpend = totalSpend + ammount);
};

const pullNoSubType = value => {
  if (!value.subType) {
    console.log(value);
    noSubType.push(value);
  }
};

runCSV(statement, fields);

module.exports = {
  runCSV: runCSV
};

/* var breakdown = [];
        var noSubType = [];
        var subType = [];
        noSubType = fields.filter(function(value) {
          if (value.subType) {
            subType.push(value);
          } else {
            return value;
          }
        });
        console.log(subType);

        fields.map(function(value) {
          value.Payee = value.Payee.toUpperCase();
          var totalSpend = 0;
          var monthlySpend = [];

          statementCSV.map(function(value2) {
            value2.payee = value2.field2.substring(
              0,
              value2.field2.indexOf("  ")
            );
            value2.amount = value2.field3.replace(/,/g, "");
            value2.monthYear = monthYearString(value2.field1);
            if (value2.payee.toUpperCase().indexOf(value.Payee) >= 0) {
              value2.accounted = 1;
              ammount = Number(value2.field3);
              if (monthlySpend.length) {
                var key = monthlySpend.length - 1;
                var monthYear = monthYearString(value2.field1);
                if (monthlySpend[key].monthYear == monthYear) {
                  monthlySpend[key].monthTot =
                    monthlySpend[key].monthTot + ammount;
                } else {
                  monthlySpend.push(monthlySpendPush(value2.field1, ammount));
                }
              } else {
                monthlySpend.push(monthlySpendPush(value2.field1, ammount));
              }
              totalSpend = totalSpend + ammount;
            }
          }); 
          breakdown.push({
            Payee: value.Payee,
            Type: value.Type,
            TotalSpend: totalSpend,
            monthlySpend: monthlySpend
          });
        });

        var totalSpend = { income: 0, expenditure: 0 };
        var monthlySpend = [];
        var monthlySpend = {
          income: [],
          expenditure: []
        };

        statementCSV.map(function(value) {
          if (!value.accounted) {
            ammount = Number(value.field3.replace(/,/g, ""));
            if (ammount < 0) {
              totalSpend.expenditure = otherSort(
                monthlySpend.expenditure,
                ammount,
                totalSpend.expenditure,
                value
              );
            } else {
              totalSpend.income = otherSort(
                monthlySpend.income,
                ammount,
                totalSpend.income,
                value
              );
            }
          }
        });

        breakdown.push([
          {
            Payee: "OtherExp",
            Type: "OtherExp",
            TotalSpend: totalSpend.expenditure,
            monthlySpend: monthlySpend.expenditure
          },
          {
            Payee: "OtherInc",
            Type: "OtherInc",
            TotalSpend: totalSpend.income,
            monthlySpend: monthlySpend.income
          }
        ]);
*/
