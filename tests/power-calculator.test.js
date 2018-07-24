const calculate = require('../src/power-calculator');
const { readdirSync } = require('fs');
const { join, sep } = require('path');

const testSourcePath = `${__dirname + sep}data-source${sep}`;
const positiveTestsPath = `${testSourcePath}positive${sep}`;
const negativeTestsPath = `${testSourcePath}negative${sep}`;

const getTestNames = (source) => readdirSync(source);

getTestNames(positiveTestsPath).forEach(testName => {
  it(testName, () => {
    let testPath = positiveTestsPath + testName;
    let input = require(join(testPath, 'input'));
    let output = require(join(testPath, 'output'));

    expect(calculate(input)).toEqual({ answer: true });
  });
});

getTestNames(negativeTestsPath).forEach(testName => {
  it(testName, () => {
    let testPath = negativeTestsPath + testName;
    let input = require(join(testPath, 'input'));
    let output = require(join(testPath, 'output'));
    expect(() => calculate(input)).toThrowError(output.error);
  });
});
