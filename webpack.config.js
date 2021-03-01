const path = require('path');

const config = {

  'entry': {
    'app':['./app/app.js']
  },
  'output': {
    'path': path.resolve(__dirname, 'live/js'),
    'filename': 'bundle.js'
  },
  'mode': 'development'
};

module.exports = config;
