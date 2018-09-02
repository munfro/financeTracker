const dsdfa = (monthlySpend, field, statement) => {
  if (statement.payee.toUpperCase().indexOf(field.Payee) >= 0) {
    statement.accounted = 1;
    ammount = Number(statement.field3);
    if (monthlySpend.length) {
      var key = monthlySpend.length - 1;
      var monthYear = monthYearString(statement.field1);
      if (monthlySpend[key].monthYear == monthYear) {
        monthlySpend[key].monthTot = monthlySpend[key].monthTot + ammount;
      } else {
        monthlySpend.push({
          monthYear: monthYearString(statement.field1),
          monthTot: ammount
        });
      }
    } else {
      monthlySpend.push({
        monthYear: monthYearString(statement.field1),
        monthTot: ammount
      });
    }
    totalSpend = totalSpend + ammount;
    transactions.push({
      Date: statement.field1,
      Ammount: ammount
    });
  }
};
