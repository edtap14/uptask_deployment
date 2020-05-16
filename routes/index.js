const express = require('express')
const router = express.Router()

//Importar express validator

const { body } = require('express-validator/check')

//Importar Controlador 
const proyectosController = require('../controllers/proyectoController')
const tareasController = require('../controllers/tareasController')
const usuariosControler = require('../controllers/usuariosController')
const authController = require('../controllers/authController')


module.exports = function(){
    // ruta para el home
    router.get('/',
        authController.UsuarioAutenticado,
        proyectosController.proyectosHome
    )
    router.get('/nuevo-proyecto',
        authController.UsuarioAutenticado,
        proyectosController.formularioProyecto
    )
    router.post('/nuevo-proyecto',
        authController.UsuarioAutenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.nuevoProyecto
    )
    
    //listar proyectos
    router.get('/proyectos/:url',
        authController.UsuarioAutenticado,
        proyectosController.proyectoPorUrl
    )

    //actualizar el proyecto 
    router.get('/proyecto/editar/:id',
        authController.UsuarioAutenticado,
        proyectosController.formularioEditar
    )
    router.post('/nuevo-proyecto/:id',
        authController.UsuarioAutenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.actualizarProyecto
    )

    //eliminar proyecto
    router.delete('/proyectos/:url',
        authController.UsuarioAutenticado,
        proyectosController.eliminarProyecto
    )

    //Tareas
    router.post('/proyectos/:url',
        authController.UsuarioAutenticado       ,
        tareasController.agregarTarea
    )
    
    //Actualizar tarea
    router.patch('/tareas/:id',
        authController.UsuarioAutenticado,
        tareasController.cambiarEstadoTarea
    )

    // Eliminar tarea
    router.delete('/tareas/:id', 
        authController.UsuarioAutenticado,
        tareasController.eliminarTarea
    )

    // Crear nueva cuenta

    router.get('/crear-cuenta', usuariosControler.formCrearCuenta)
    router.post('/crear-cuenta', usuariosControler.crearCuenta)
    router.get('/confirmar/:correo', usuariosControler.confirmarCuenta)

    // Iniciar sesión

    router.get('/iniciar-sesion', usuariosControler.formIniciarSesion)
    router.post('/iniciar-sesion', authController.autenticarUsuario )

    // cerrar sesion

    router.get('/cerrar-sesion', authController.cerrarSesion)

    //restablecer contraseña
    router.get('/reestablecer', usuariosControler.formRestablecerPassword)
    router.post('/reestablecer', authController.enviarToken)
    router.get('/reestablecer/:token', authController.validarToken)
    router.post('/reestablecer/:token', authController.actualizarPassword)

    return router
}