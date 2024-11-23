'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

//security headers
app.use(
  helmet({
    frameguard: { action: 'sameorigin' }, //only allow iframes on the same origin
    dnsPrefetchControl: { allow: false }, //disable DNS prefetching
    referrerPolicy: { policy: 'same-origin' }, //send referrer only for same-origin requests
  })
);

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); // for FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app
  .route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app
  .route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//index page
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//for FCC testing purposes
fccTestingRoutes(app);

//routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found');
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
