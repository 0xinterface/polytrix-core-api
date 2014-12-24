exports.provider = require('./lib/provider.js');
exports.client = require('./lib/client.js');
exports.transform = require('./lib/transform.js');
exports.config = {
    client_scope : "wl.basic wl.emails wl.offline_access wl.skydrive_update",
    interfaces : ["oauth"]
};