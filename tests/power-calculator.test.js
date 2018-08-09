const calculate = require('../src/power-calculator');
const validate = require('../src/validator');
const { readdirSync } = require('fs');
const { join, sep } = require('path');

const testSourcePath = `${__dirname + sep}data-source${sep}`;
const calculationTestsPath = `${testSourcePath}calculation${sep}`;
const validationTestsPath = `${testSourcePath}validation${sep}`;

const getTestNames = (source) => readdirSync(source);

getTestNames(calculationTestsPath).forEach(testName => {
  it(testName, () => {
    let testPath = calculationTestsPath + testName;
    let input = require(join(testPath, 'input'));
    let output = require(join(testPath, 'output'));

    expect(calculate(input)).toEqual(output);
  });
});

getTestNames(validationTestsPath).forEach(testName => {
  it(testName, () => {
    let testPath = validationTestsPath + testName;
    let input = require(join(testPath, 'input'));
    let output = require(join(testPath, 'output'));
    expect(() => validate(input)).toThrowError(output.error);
  });
});
