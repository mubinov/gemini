'use strict';

var _ = require('lodash'),
    path = require('path'),

    DEFAULT_REPORT_OUT_DIR = 'gemini-report',
    reportDir = DEFAULT_REPORT_OUT_DIR,

    referencePath = _.partial(createPath, 'ref'),
    currentPath = _.partial(createPath, 'current'),
    diffPath = _.partial(createPath, 'diff');

/**
 * @param {String} kind - one of these values: 'ref', 'current', 'diff'
 * @param {StateResult} result
 * @returns {String}
 */
function createPath(kind, result) {
    var retrySuffix = _.isUndefined(result.attempt) ? '' : `_${result.attempt}`;

    var components = [].concat('images', result.suite.path, result.state.name, result.browserId + '~' + kind + retrySuffix + '.png');
    return path.join.apply(null, components);
}

function setReportDir(dir) {
    reportDir = dir || DEFAULT_REPORT_OUT_DIR;
}

function getReportDir() {
    return reportDir;
}

function getAbsolutePath(localPath) {
    return path.resolve(reportDir, localPath);
}

module.exports = {
    REPORT_DIR: reportDir,

    referencePath: referencePath,
    currentPath: currentPath,
    diffPath: diffPath,

    referenceAbsolutePath: _.flowRight(getAbsolutePath, referencePath),
    currentAbsolutePath: _.flowRight(getAbsolutePath, currentPath),
    diffAbsolutePath: _.flowRight(getAbsolutePath, diffPath),

    setReportDir: setReportDir,
    getReportDir: getReportDir,
};
