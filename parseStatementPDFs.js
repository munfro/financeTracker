var fs = require("fs");
var pdf = require("pdf-parse");

path = __dirname + "/trialStatement/statements.pdf";
//path = __dirname + "/trialStatement/Aug1-12[18].pdf";

let dataBuffer = fs.readFileSync(path);

pdf(dataBuffer).then(function(data) {
  body = data.text;
  var pop = body.split("impaired customers A . ")[1];
  console.log("NEXT ONE HERE \n");
  //console.log(pop);
  openingBalance = findOpeningBalance(body);
  b = pop.indexOf("Your Graduate Bank Account  details Your Statement");
  first = pop.substring(0, a - 11);
  //console.log(pop.substring(0, pop.lastIndexOf("Dat e Pay m e nt  t")));
});

const findOpeningBalance = body => {
  a = body.indexOf("BALANCE BROUGHT FORW ARD");
  alen = "BALANCE BROUGHT FORW ARD".length;
  var openingBalance = body
    .substring(a + alen, a + alen + 10)
    .replace(/ /g, "");
  if (openingBalance[openingBalance.length - 1].toUpperCase() == "D") {
    openingBalance = Number("-" + openingBalance.replace(/[A-Z]/g, ""));
  } else {
    openingBalance = Number(openingBalance.replace(/[A-Z]/g, ""));
  }
  return openingBalance;
};
