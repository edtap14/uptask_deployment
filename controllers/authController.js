const passport = require('passport')
const Usuarios = require('../models/Usuarios')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios   '
})

// Función para revisar si el usuario esta logeado

exports.UsuarioAutenticado = (req, res, next) => {

    //si el usuario está autenticado, adelante
    if(req.isAuthenticated()){
        return next()
    }
    // si no esta autenticado, redirigir al formulario
    return res.redirect('/iniciar-sesion')
}

// funcion para cerrar sesion

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion') 
    })
}

// Genera un token si el usuario es valido

exports.enviarToken = async (req, res) => {
    // verificar que el usuario exista
    const {email} = req.body
    const usuario = await Usuarios.findOne({where: {email}})

    //si no existe el usuario
    if(!usuario){
        req.flash('error', 'No existe esa cuenta')
        res.redirect('/reestablecer')
    }

    // usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex')
    usuario.expiracion = Date.now() + 3600000
    
    //Guardarlos en la base de datos
    await usuario.save()

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`

    // enviar le correo con el token

    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'
    })
    // Terminar
    req.flash('correcto', 'Se envió un mensaje a tu correo')
    res.redirect('/iniciar-sesion')
}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    })

    // si no encuentra el usuario
    if(!usuario){
        req.flash('error', 'No valido')
        res.redirect('/reestablecer')
    }

    // Formulario para generar el password
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Contraseña'

    })
}

//Cambia el password por uno nuevo

exports.actualizarPassword = async (req, res) => {
    
    //Verifica el token valido pero tambien la fecha de expiración
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    })
    // verificamos si el usuario existe
    if(!usuario){
        req.flash('error', 'Token no valido')
        res.redirect('/reestablecer')
    }

    //hashear el nuevo password

    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    usuario.token = null
    usuario.expiracion = null

    // Guardamos el nuevo password

    await usuario.save()

    req.flash('correcto', 'Tu password se ha modificado correctamente')
    res.redirect('/iniciar-sesion')
}