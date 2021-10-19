const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//importar las variables


//helpers con algunas funciones
const helpers = require('./helpers');

//Crear la conexion a la base de datos
const db = require('./config/db');

//importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(()=> console.log('conectado al server'))
    .catch(error => console.log(error))

//Crear una app de express
const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

// Habilitar pug
app.set('view engine','pug');

//habilitar bodyparser para leer datos del form
app.use(express.urlencoded({extended: true}));

//añadir la carpeta de las vistas
app.set('views', path.join(__dirname,'./views'));

//agregar flash messages
app.use(flash());

app.use(cookieParser());

//Sessiones nos permite a navegar en diferentes lados sin volver a indentificarme
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Pasar vardum a la app
app.use((req,res,next)=>{
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});


//ruta para el home
app.use('/',routes());

//servidor y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port,host,()=>{
    console.log('El servidor esta funcionando');
})

