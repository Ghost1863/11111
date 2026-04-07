const fs = require('fs');
const path = require('path');

const REPO_SCOPES = ['deps', 'release', 'docs', 'root'];

const packagesDir = path.resolve(__dirname, 'packages');
const packageScopes = fs.readdirSync(packagesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name.replace(/^medusa-/, ''));

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [...packageScopes, ...REPO_SCOPES]],
    'scope-empty': [1, 'never'],
    'header-max-length': [2, 'always', 100],
  },
};
