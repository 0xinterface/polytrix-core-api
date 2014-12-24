var filefog = require('filefog');
var fs = require('fs');

filefog.use('dropbox',require('filefog-dropbox'),{
	client_key : 'jixx3poq3ysx5fo',
	client_secret : 'q6een1n7vuro900',
	redirect_url: 'http://localhost:3000/api/dropbox/redirect/'
});

var dropboxProvider = filefog.provider("dropbox");

function route(app){

	function requieLogin(req, res, next){
		var sess=req.session;
		if(sess.dropbox_access_token){
			next();
		}else{
			res.redirect('/api/dropbox/auth/');
		}
	}

	app.get('/api/dropbox/auth/',function(req, res){
		var sess=req.session;
		if(sess.dropbox_access_token){
			console.log('user already login');
			res.redirect('/api/dropbox/home/');
		}else{
			auth(req, res);
		}
	});

	app.get('/api/dropbox/redirect/',function(req,res){
		redirect(req, res).
		then(function(){
			res.redirect('/api/dropbox/home/');
		}).done();
	});

	app.get('/api/dropbox/status/',function(req,res){
		var sess=req.session;
		if(sess.dropbox_access_token){
			res.send('logined');
		}else{
			res.send('not logined');
		}
	});

	app.get('/api/dropbox/fileIndex/',requieLogin,function(req,res){
		var sess=req.session;
		if(sess.dropbox_access_token){
			getFolderMetadata(sess.dropbox_access_token,req.query.i,
				function(metadata){
					console.log("metadata acquired");
					res.send(metadata);
			});
		}else{
			res.send('not logined');
		}
	});

	app.get('/api/dropbox/download/',requieLogin,function(req,res){
		var sess=req.session;
		if(!req.query.i)
			res.send("identifier not set");
		else{
			downloadFile(sess.dropbox_access_token,req.query.i,
				function(data){
					console.log(data.data);
					console.log("stat:");
					console.log(data._raw.stat);
					var stat = data._raw.stat;
					
					//res.send(data.data);

					res.writeHead(200, {
						'Content-Type': stat.mimeType,
						'Content-Length': stat.size
					});

					res.write(data.data);
					res.end();
					console.log("download called and responsed");
			});
		}
	});

	app.get('/api/dropbox/home/',function(req,res){
		res.sendFile(__dirname + '/public/views/dropbox_home.html');
	});
}

function downloadFile(access_token,location,callback){
	dropboxClient = filefog.client("dropbox", {
		access_token: access_token,
		refresh_token: null
	})
	.then(function (client) {
		return client.downloadFile(location);
	}).then(callback);
}

function getFolderMetadata(access_token,location,callback){
	dropboxClient = filefog.client("dropbox", {
		access_token: access_token,
		refresh_token: null
	})
	.then(function (client) {
		return client.retrieveFolderItems(location);
		//return client.getFolderInformation(location);
	}).then(callback);
}

function auth(req, res){
	var url = dropboxProvider.oAuthGetAuthorizeUrl();
	res.redirect(url);
}


function redirect(req,res){
	var token = dropboxProvider.oAuthGetAccessToken(req.query.code);

	return token.then(function(results){
		var sess=req.session;
		sess.dropbox_access_token = results.access_token;
		console.log(results);
	}).catch(function(err){
		console.log(err);
	});
}

module.exports = {
	route : route,
	auth : auth,
	redirect : redirect
};

// dropboxClient = filefog.client("dropbox", {
//     access_token: '...',
//     refresh_token: '...'
// })
// .then(function (client) {
//     return client.getFolderInformation();
// }).then(function (response) {
//     //Dropbox folder metadata, in a standardized format.
// });