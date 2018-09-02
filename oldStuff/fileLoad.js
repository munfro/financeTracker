var fs = require("fs");
var csv = require("csvtojson");
var prompt = require("prompt");

const runCSV = (statement, fields) => {
  csv({})
    .fromFile(fields)
    .then(fieldsCSV => {
      csv({
        noheader: true
      })
        .fromFile(statement)
        .then(statementCSV => {
          var trial = [];
          fieldsCSV.map(function(value) {
            value.Payee = value.Payee.toUpperCase();
            var transactions = [];
            var totalSpend = 0;
            var monthlySpend = [];

            statementCSV.map(function(value2) {
              value2.payee = value2.field2.substring(
                0,
                value2.field2.indexOf("  ")
              );
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
                    monthlySpend.push({
                      monthYear: monthYearString(value2.field1),
                      monthTot: ammount
                    });
                  }
                } else {
                  monthlySpend.push({
                    monthYear: monthYearString(value2.field1),
                    monthTot: ammount
                  });
                }
                totalSpend = totalSpend + ammount;
                transactions.push({
                  Date: value2.field1,
                  Ammount: ammount
                });
              }
            }); //*/
            trial.push({
              Payee: value.Payee,
              Type: value.Type,
              Transactions: transactions,
              TotalSpend: totalSpend,
              monthlySpend: monthlySpend
            });
          });

          var transactions = [];
          var totalSpend = 0;
          var monthlySpend = [];

          statementCSV.map(function(value) {
            if (!value.accounted) {
              ammount = Number(value.field3);
              if (monthlySpend.length) {
                var key = monthlySpend.length - 1;
                var monthYear = monthYearString(value.field1);

                if (monthlySpend[key].monthYear == monthYear) {
                  monthlySpend[key].monthTot =
                    monthlySpend[key].monthTot + ammount;
                } else {
                  monthlySpend.push({
                    monthYear: monthYearString(value.field1),
                    monthTot: ammount
                  });
                }
              } else {
                monthlySpend.push({
                  monthYear: monthYearString(value.field1),
                  monthTot: ammount
                });
              }
              totalSpend = totalSpend + ammount;
              transactions.push({
                Date: value.field1,
                Ammount: ammount
              });
            }
          });

          trial.push({
            Payee: "Other",
            Type: "Other",
            Transactions: transactions,
            TotalSpend: totalSpend,
            monthlySpend: monthlySpend
          });
        });
    });
};

const monthYearString = input => {
  return input.substring(6, 10) + "-" + input.substring(3, 5);
};

runCSV(statement, fields);
