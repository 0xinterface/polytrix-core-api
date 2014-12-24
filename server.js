var express		= require('express'),
	session		= require('express-session'),
	bodyParser	= require('body-parser'),
	app			= express();

var dropbox = require('./dropbox');
var onedrive = require('./onedrive');

app.use("/js",express.static(__dirname + '/public/js'));

// parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// enable session
app.use(session({
	secret: 'polytrix_session',
	resave: false,
	saveUninitialized: true
}));

// routes
dropbox.route(app);
onedrive.route(app);


//=============================
app.get('/',function(req, res){
	res.send('hello world!');
});

app.listen(3000,function(){
	console.log('server started!');
});