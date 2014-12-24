/**
 * Run integration tests
 *
 * Uses the `filefog-provider-tests` module to
 * run mocha tests against the appropriate version
 * of Filefog.
 */


/**
 * Module dependencies
 */

var mocha = require('mocha');
var TestRunner = require('filefog-provider-tests').TestRunner
var Definition = require('../index.js');
var winston = require('winston');


// Grab targeted interfaces from this adapter's `package.json` file:
var package = {}
try {
    package = require('../package.json');
} catch (e) {
    throw new Error(
            '\n' +
            'Could not read package.json :: ' + '\n' +
            util.inspect(e)
    );
}



winston.info('Testing `' + package.name + '`, a Filefog provider definition.');
winston.info('Running `filefog-provider-tests`... ');
winston.log();



/**
 * Integration Test Runner
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the specified interfaces
 * of the currently-implemented Waterline adapter API.
 */
new TestRunner({

    // Mocha opts
    mocha: {
        bail: true
    },
    name: package.name,
    // Load the provider module.
    definition: Definition,

    // Default connection config to use.
    config: {
        client_key: '000000004C10EA03',
        client_secret: 'YfSMQ7El6nN5hotB4zDKtrpishCd1P4M',
        redirect_url : 'http://www.example.edu/service/callback/skydrive' //localhost is disabled on skydrive, using reserved example.* domain.
    },
    credentials: {
        _gist : '8b03e9461088987f2550'
    }


});
