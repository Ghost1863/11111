// Scopes correspond to workspace packages (packages/*), without the "medusa-" prefix.
const PACKAGE_SCOPES = [
  '1c',
  'feed-yandex',
  'fulfillment-apiship',
  'payment-robokassa',
  'payment-tkassa',
  'test',
];

// Top-level scopes not tied to a specific package
const REPO_SCOPES = ['deps', 'release', 'docs', 'root'];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [...PACKAGE_SCOPES, ...REPO_SCOPES]],
    'scope-empty': [1, 'never'], // warn if scope is missing
    'header-max-length': [2, 'always', 100],
  },
};


