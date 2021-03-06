'use strict';

var _ = require('underscore');
var path = require('path');
var util = require('util');
var worker = require('./worker.js');

function setupGlobals() {
  global.who = 'reqKick|reqKick.app.js';
  global.logger = require('./common/logger.js')();

  var runMode = process.env.RUN_MODE;
  // default log level is warn
  var logLevel = 'warn';

  if (runMode === 'dev')
    logLevel = 'debug';
  else if (runMode === 'beta')
    logLevel = 'verbose';
  else if (runMode === 'production')
    logLevel = 'warn';

  logger.level = logLevel;
}

function checkENVs() {
  var who = global.who + '|' + checkENVs.name;
  logger.info(who, 'Inside');

  var expectedENVs = ['STATUS_DIR', 'SCRIPTS_DIR', 'REQEXEC_BIN_PATH'];

  var errors = [];
  _.each(expectedENVs,
    function (expectedENV) {
      if (_.isEmpty(process.env[expectedENV]))
        errors.push(
          util.format('%s: Missing ENV: %s', global.who, expectedENV)
        );
    }
  );

  if (!_.isEmpty(errors)) {
    _.each(errors,
      function (error) {
        logger.error(error);
      }
    );
    process.exit(1);
  }
}

function setupConfig() {
  var who = global.who + '|' + setupConfig.name;
  logger.info(who, 'Inside');

  global.config = {
    statusDir: process.env.STATUS_DIR,
    scriptsDir: process.env.SCRIPTS_DIR,
    reqExecBinPath: process.env.REQEXEC_BIN_PATH,
    pollIntervalMS: 5000
  };

  global.config.jobWhoPath = path.join(global.config.statusDir, 'job.who');
  global.config.jobStatusPath = path.join(
    global.config.statusDir,
    'job.status'
  );
  global.config.jobENVPath = path.join(global.config.statusDir, 'job.env');
  global.config.jobStepsPath = path.join(
    global.config.statusDir,
    'job.steps.path'
  );
}

function reqKick() {
  setupGlobals();
  checkENVs();
  setupConfig();
  worker();
}

reqKick();
