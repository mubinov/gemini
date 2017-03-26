'use strict';

var _ = require('lodash'),
    Handlebars = require('handlebars'),
    Promise = require('bluebird'),
    fs = require('fs-extra'),
    path = require('path'),
    lib = require('./lib'),

    ViewModel = require('./view-model');

const pathToUrl = (filePath) => filePath.split(path.sep).map((item) => encodeURIComponent(item)).join('/');

Handlebars.registerHelper('section-status', function () {
    if (this.result && this.result.skipped) {
        return 'section_status_skip';
    }

    if (ViewModel.hasFails(this)) {
        return 'section_status_fail';
    }

    if (ViewModel.hasWarnings(this)) {
        return 'section_status_warning';
    }

    return 'section_status_success';
});

Handlebars.registerHelper('image-box-status', function() {
    var result = this.result;

    if (result.error) {
        return 'image-box_error';
    }

    if (result.warning) {
        return 'image-box_warning';
    }

    return '';
});

Handlebars.registerHelper('has-retries', function() {
    return ViewModel.hasRetries(this) ? 'has-retries' : '';
});

Handlebars.registerHelper('has-fails', function() {
    return this.failed > 0 ? 'summary__key_has-fails' : '';
});

Handlebars.registerHelper('image', function(kind) {
    const url = pathToUrl(this[kind + 'Path']);
    return new Handlebars.SafeString('<img data-src="' + url + '">');
});

Handlebars.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
});

function loadTemplate(name) {
    return fs.readFileAsync(path.join(__dirname, 'templates', name), 'utf8');
}

function copyToReportDir(fileName) {
    return fs.copyAsync(path.join(__dirname, 'static', fileName), makeOutFilePath(fileName));
}

function makeOutFilePath (fileName){
   return path.join(lib.getReportDir(), fileName);
}

module.exports = {
    /**
     * @param {ViewModelResult} model
     * returns {Promise}
     */
    createHtml: function(model) {
        return Promise.all([
            loadTemplate('suite.hbs'),
            loadTemplate('state.hbs'),
            loadTemplate('report.hbs')
        ])
         .spread(function(suiteTemplate, stateTemplate, reportTemplate) {
             Handlebars.registerPartial('suite', suiteTemplate);
             Handlebars.registerPartial('state', stateTemplate);

             return Handlebars.compile(reportTemplate, {preventIndent: true})(model);
         });
    },

    /**
     * @param {String} html
     * returns {Promise}
     */
    save: function (html) {
        return fs.mkdirsAsync(lib.getReportDir())
            .then(() => Promise.all([
                fs.writeFileAsync(makeOutFilePath('index.html'), html, 'utf8'),
                copyToReportDir('report.min.js'),
                copyToReportDir('report.css')
            ]));
    }
};
