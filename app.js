// DEBUG=twelve-pics-blog-api:* npm run start
var express = require('express');
var path = require('path');
var cors = require('cors')
var logger = require('morgan');

const arango_connection = require('./db/arangodb');

var indexRouter = require('./routes/index');
var subscribersRouter = require('./routes/subscribers');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


var corsOptionsDev = {
    origin: 'http://172.26.58.74:8080/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
var corsOptionsProd = {
    origin: 'https://blog.twelvepics.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

if (process.env.NODE_ENV === 'dev') {
    // app.use(cors(corsOptionsDev));
    app.use(cors())

} else {
    app.use(cors(corsOptionsProd));
}
// app.use(cors());

app.use('/', indexRouter);
app.use('/subscribers', subscribersRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// init connection ONCE HERE
arango_connection.connect()

module.exports = app;
