var path = require('path');
var Joi = require('joi');
var fs = require('fs');
var readLine = require('readline');
var varsDir = '/../../../app/scss/ept/variables';
var defaultVarsPath = path.normalize(__dirname + varsDir + '/_default-variables.scss');
var customPath = '/../../../content/sass/_custom-variables.scss';
var customVarsPath = path.normalize(__dirname + customPath);
var previewVarsPath = path.normalize(__dirname + varsDir + '/_preview-variables.scss');

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /admin/settings/theme (Admin) Get Theme
  * @apiName GetTheme
  * @apiDescription Used to fetch theme vars in _custom-variables.scss
  *
  * @apiSuccess {string} base-line-height Base line height for entire forum
  * @apiSuccess {string} base-background-color The background color for the entire forum
  * @apiSuccess {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} base-font-sans Font family for the entire forum
  * @apiSuccess {string} base-font-color Base font color for entire forum
  * @apiSuccess {string} base-font-size Base font size for entire forum
  * @apiSuccess {string} secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} input-font-color Font color for input fields
  * @apiSuccess {string} input-background-color Background color for all input fields
  * @apiSuccess {string} border-color Color for all borders used in the forum
  * @apiSuccess {string} header-bg-color Color for the forum header background
  * @apiSuccess {string} header-font-color Font color for the forum header
  * @apiSuccess {string} sub-header-color Color for sub headers and footers
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the theme.
  */
module.exports = {
  method: 'GET',
  path: '/api/admin/settings/theme',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'adminSettings.getTheme' },
    validate: { query: { preview: Joi.boolean() } }
  },
  handler: function(request, reply) {
    var preview = request.query.preview;
    var previewExists = fs.statSync(previewVarsPath).size;
    var readFilePath = preview && previewExists ? previewVarsPath : customVarsPath;
    var rl = readLine.createInterface({
      input: fs.createReadStream(readFilePath),
      terminal: false
    });
    var theme = {};
    rl.on('line', function (line) {
      if (line.charAt(0) === '$') {
        var lineArr = line.split(':');
        var key = lineArr[0].split('$')[1].trim();
        var val = lineArr[1].split(';')[0].trim();
        theme[key] = val;
      }
    })
    .on('close', function() { reply(theme); });
  }
};
