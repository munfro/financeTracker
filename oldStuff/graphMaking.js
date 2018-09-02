var plotly = require("plotly")({
  username: "munfro",
  apiKey: "xxjnRilslnzzzUemvw55"
});

async function lineGraph(input) {
  data = [];

  const a = input.map(async function(val, key) {
    if (key < 15) {
      var x = [];
      var y = [];

      val.monthlySpend.map(function(value) {
        if (value.monthTot < 0) {
          x.push(value.monthYear);
          y.push(Math.abs(value.monthTot));
        }
      });
      data.push({
        x: x,
        y: y,
        type: "scatter",
        name: val.Payee,
        line: { shape: "spline", smoothing: 1 }
      });
    }

    const output = await postData(data, graphOptions);

    return output;
  });

  const b = await Promise.all(a);
  var graphOptions = { filename: "dates", filelopt: "overwrite" };
}

const postData = (data, graphOptions) => {
  return new Promise(function(res, rej) {
    plotly.plot(data, graphOptions, function(err, msg) {
      res(msg);
    });
  });
};

module.exports = {
  lineGraph: lineGraph
};
