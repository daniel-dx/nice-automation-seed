const HTMLReport = require("@danieldx/jasmine-xml2html-converter");

// Call custom report for html output
testConfig = {
  reportTitle: "自动化测试报告",
  outputPath: "./",
  outputFile: "report.html",
};
new HTMLReport().from("./results.xml", testConfig);
