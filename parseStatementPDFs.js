var fs = require("fs");
var pdf = require("pdf-parse");

path = __dirname + "/trialStatement/statements.pdf";

let dataBuffer = fs.readFileSync(path);

pdf(dataBuffer).then(function(data) {
  body = data.text;
  var pop = body.split("impaired customers A . ")[1];
  console.log(pop);
});
