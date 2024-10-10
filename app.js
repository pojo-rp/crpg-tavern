require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');

const multer = require('multer');
const upload = multer({dest: './public/img/'});


const connectDB = require('./server/config/db.js');
const session = require('express-session');

const {isActiveRoute} = require('./server/helpers/routeHelpers.js');

const app = express();
const port = process.env.PORT || 5000;

//Connect to DB
connectDB();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'nice-sword',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {maxAge: 300000}

}));

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css')) 
app.use('/img', express.static(__dirname + 'public/img')) 
app.use('/js', express.static(__dirname + 'public/js')) 

//templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(port, () => console.log(`Listening on Port ${port}`))


