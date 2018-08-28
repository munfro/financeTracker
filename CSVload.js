var fs = require("fs");
var csv = require("csvtojson");

var statement = __dirname + "/trialStatement/oldStatement.csv";
//var fields = __dirname + "/trialStatement/fields.csv";
var fields = require(__dirname + "/trialStatement/fields.json");

const runCSV = (statement, fields) => {
  return new Promise(function(res, rej) {
    //loading the CSV file with different payee fields
    /*csv({})
      .fromFile(fields)
      .then(fieldsCSV => {
        //loading the CSV with statements*/
    csv({
      noheader: true
    })
      .fromFile(statement)
      .then(statementCSV => {
        var duration = statementDuration(statementCSV);
        var breakdown = [];
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
          }); //*/
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

        //console.log(breakdown[breakdown.length - 1]);
        res({
          breakdown: breakdown,
          duration: duration,
          statement: statementCSV
        });
      });
    //});
  });
};

const monthYearString = input => {
  return input.substring(6, 10) + "-" + input.substring(3, 5);
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
