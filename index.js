const express = require('express')
const routes = require('./routes')
const path = require('path')
const bodyParser =require('body-parser')
const expressValidator = require("express-validator")
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./config/passport')
// Inportar variables .ENV
require('dotenv').config({path: 'variables.env'})

//Helpers con algunas funciones

const helpers = require('./helpers')

//Crear conexión a base de datos

const db = require('./config/db')

// importar el modelo
require('./models/Proyectos')
require('./models/Tareas')
require('./models/Usuarios')

db.sync()
    .then(()=> console.log('conectado al servidor'))
    .catch(error => console.log(error))

//crear una app de express
const app = express()

//Donde cargar los archivos estaticos
app.use(express.static('public'))

//Habilitar pug
app.set('view engine', 'pug')

//habilitar bodyParser para leer datos del formulario
app.use(bodyParser.urlencoded({extended: true}))

// Agregamos express validator a toda la aplicación
app.use(expressValidator());

//añadir carpeta de vistas
app.set('views', path.join(__dirname, './views'))

// agregar flash messages
app.use(flash())

// Cookie parser

app.use(cookieParser())

//sesiones nos permite navegar en diferentes paginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

//pasar var dump a la aplicacion

app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump //locals, crea variables globales en el proyecto
    res.locals.mensajes = req.flash()
    res.locals.usuario = {...req.user} || null
    next(); // next sirve para seguir ejecutando los siguientes middelwares
})



app.use('/', routes() )

// Servidor y puerto

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

app.listen(port, host, () => {
    console.log('El servidor está funcionando')
})