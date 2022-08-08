const HTMLReport = require("@danieldx/jasmine-xml2html-converter");

// Call custom report for html output
testConfig = {
  reportTitle: "WeDa 低代码平台（专有版）平台自动化测试报告",
  outputPath: "./",
  outputFile: "report.html",
};
new HTMLReport().from("./results.xml", testConfig);
