var filefog = require('filefog');
var request = require('request');

filefog.use('onedrive', require('filefog-onedrive'),{
	client_key : '000000004413589F',
	client_secret : '9ozLAtytWthS-MROn9Z7CK7be7DJjZ3a',
	scope: 'wl.offline_access wl.skydrive_update',
	redirect_url: 'http://apptesting.io:3000/api/onedrive/redirect/'
});

var onedriveProvider = filefog.provider("onedrive");

function route(app){

	function requieLogin(req, res, next){
		var sess=req.session;
		if(sess.onedrive_access_token){
			next();
		}else{
			res.redirect('/api/onedrive/auth/');
		}
	}

	app.get('/api/onedrive/auth/',function(req, res){
		auth(req, res);
	});

	app.get('/api/onedrive/redirect/',function(req,res){
		redirect(req, res).
		then(function(){
			res.redirect('/api/onedrive/home/');
		});
	});

	app.get('/api/onedrive/fileIndex/',requieLogin,function(req,res){
		var sess=req.session;
		console.log("metadata called");
		if(sess.onedrive_access_token){
			console.log("onedrive_access_token found");
			getFolderMetadata(sess.onedrive_access_token,sess.onedrive_refresh_token,req.query.i,
				function(metadata){
					console.log("metadata acquired");
					res.send(metadata);
			});
		}else{
			res.send('not logined');
		}
	});

	app.get('/api/onedrive/download/',requieLogin,function(req,res){
		var sess=req.session;
		if(!req.query.i)
			res.send("identifier not set");
		else{
			downloadFile(sess.onedrive_access_token,sess.onedrive_refresh_token,req.query.i,
				function(data){
					console.log(data.data);
					console.log("stat:");
					console.log(data._raw.stat);
					var stat = data._raw.stat;
					
					res.send(data.data);

					// res.writeHead(200, {
					// 	'Content-Type': stat.mimeType,
					// 	'Content-Length': stat.size
					// });

					// res.write(data.data);
					// res.end();
					console.log("download called and responsed");
			});
		}
	});

	app.get('/api/onedrive/home/',function(req,res){
		res.sendFile(__dirname + '/public/views/onedrive_home.html');
	});
}

function auth(req, res, callback){
	///api/onedrive/index/
	var url = onedriveProvider.oAuthGetAuthorizeUrl();
	res.redirect(url);
}

function redirect(req,res){
    var token = getTokenByCode(req.query.code);
	return token.then(function(results){
		var sess=req.session;
		sess.onedrive_access_token = results.access_token;
		sess.onedrive_refresh_token = results.refresh_token;
		console.log(results);
	}).catch(function(err){
		console.log(err);
	});
}

function downloadFile(access_token,refresh_token,location,callback){
	onedriveClient = filefog.client("onedrive", {
		access_token: access_token,
		refresh_token: refresh_token
	})
	.then(function (client) {
		return client.downloadFile(location);
	}).then(callback);
}

function getFolderMetadata(access_token,refresh_token,location,callback){
	onedriveClient = filefog.client("onedrive", {
		access_token: access_token,
		refresh_token: refresh_token
	})
	.then(function (client) {
		return client.retrieveFolderItems(location);
		//return client.getFolderInformation(location);
	}).then(callback);
}

module.exports = {
	route : route,
	auth : auth,
	redirect : redirect
};












///======================
function getTokenByCode(code){
	return new _getTokenByCode(code);
}
function _getTokenByCode(code){
	this._then = [];
	var _this = this;

	request.post(
		'https://login.live.com/oauth20_token.srf',
		{
			form: {
				code: code,
				grant_type: 'authorization_code',
				client_id: onedriveProvider.config.client_key, // get client id by config later
				client_secret: onedriveProvider.config.client_secret,  // get client secret by config later
				redirect_uri: onedriveProvider.config.redirect_url
			},
			rejectUnauthorized: false,
			requestCert: true
		},
		function (error, response, body) {
			if(error && _this.errorCallback)
				_this.errorCallback(error);
			else if (response.statusCode == 200) {
				for(var i in _this._then){
					var callback = _this._then[i];
					callback(body);
				}
			}else if(_this.errorCallback){
				_this.errorCallback(response);
			}
		}
	);
}
_getTokenByCode.prototype.catch = function(errorCallback){
	this.errorCallback = errorCallback;
	return this;
};
_getTokenByCode.prototype.then = function(callback){
	this._then.push(callback);
	return this;
};