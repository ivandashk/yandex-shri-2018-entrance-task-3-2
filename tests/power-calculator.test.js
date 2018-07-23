const calculate = require('../src/power-calculator');
const { lstatSync, readdirSync } = require('fs');
const { join, basename, sep } = require('path');

const testSourcePath = __dirname + sep + 'data-source' + sep;
const getTestNames = () => readdirSync(testSourcePath);

getTestNames().forEach(testName => {
  it(testName, () => {
    let testPath = testSourcePath + testName;
    let input = require(join(testPath, 'input'));
    let output = require(join(testPath, 'output'));

    expect(calculate(input)).toEqual({ answer: true });
  });
});
