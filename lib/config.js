'use strict';

const { deepFreeze } = require('./utils');
const logger = require('bunyan-adaptor')();

const env = process.env;
const pkg = require('../package.json');

let prefix = 'MICROPUB_';

prefix = env[prefix + 'PREFIX'] || prefix;

// Load the dotenv file
if (process.env.DOTENV_FILE) {
  const dotEnvResult = require('dotenv').config({
    path: process.env.DOTENV_FILE
  });
  if (dotEnvResult.error) { throw dotEnvResult.error; }
} else {
  // Fail silently if we assume default dotenv file location
  require('dotenv').config();
}

/**
 * @template T
 * @param {T} value
 * @param {boolean} defaultToValue
 * @returns {T|any[]|Object<string,any>}
 */
const parseJSON = (value, defaultToValue) => {
  let result;

  if (value) {
    try {
      result = JSON.parse(value);
    } catch (err) {
      logger.debug(JSON.stringify(err));
    }
  }

  if (!result && defaultToValue) {
    return value;
  }
};

const parseJSONList = (value) => [].concat(parseJSON(value) || []);

const config = {
  version: pkg.version,
  env: env.NODE_ENV || 'production',
  port: env.PORT || 8080,
  host: env[prefix + 'HOST'],
  github: {
    user: env[prefix + 'GITHUB_USER'],
    token: env[prefix + 'GITHUB_TOKEN'],
    branch: env[prefix + 'GITHUB_BRANCH']
  },
  site: {
    url: env[prefix + 'SITE_URL'],
    repo: env[prefix + 'SITE_GITHUB_REPO'],
    syndicateToUid: env[prefix + 'SITE_SYNDICATE_TO_UID'],
    syndicateToName: env[prefix + 'SITE_SYNDICATE_TO_NAME'],
    syndicateTo: JSON.parse(env[prefix + 'SITE_SYNDICATE_TO']),
    mediaEndpoint: env[prefix + 'MEDIA_ENDPOINT_URL']
  },
  sites: false,
  token: env[prefix + 'TOKEN_ENDPOINT']
    ? [{
      endpoint: env[prefix + 'TOKEN_ENDPOINT'],
      me: env[prefix + 'TOKEN_ME'] || env[prefix + 'SITE_URL']
    }]
    : [],
  handlerOptions: {
    noAutoConfigure: !!env[prefix + 'OPTION_NO_AUTO_CONFIGURE'],
    deriveCategory: parseJSON(env[prefix + 'OPTION_DERIVE_CATEGORY']) || false,
    deriveLanguages: (env[prefix + 'OPTION_DERIVE_LANGUAGES'] || '').split(',').filter(item => !!item),
    layoutName: parseJSON(env[prefix + 'LAYOUT_NAME'], true),
    filenameStyle: parseJSON(env[prefix + 'FILENAME_STYLE'], true),
    mediaFilesStyle: parseJSON(env[prefix + 'MEDIA_FILES_STYLE'], true),
    permalinkStyle: parseJSON(env[prefix + 'PERMALINK_STYLE'], true),
    encodeHTML: parseJSON(env[prefix + 'ENCODE_HTML'])
  }
};

config.userAgent = pkg.name + '/' + config.version + ' (' + pkg.homepage + ')';

module.exports = deepFreeze(config);
