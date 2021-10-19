const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});


//funcion para verificar si el usuario esta logeado
exports.usuarioAutenticado = (req,res,next) =>{
    //si esta autenticado adelante
    if(req.isAuthenticated()){
        return next();
    }

    //si no esta, redirigir
    return res.redirect('/iniciar-sesion');
}

//funcion para cerrar sesion
exports.cerrarSesion = (req,res) =>{
    req.session.destroy(()=>{
        res.redirect('/iniciar-sesion'); //al cerrar la sesion
    })
}

//Genera un token si el usuario es valido
exports.enviarToken = async (req,res) =>{
    //verificar el usuario existe
    const {email} =  req.body;
    const usuario = await Usuarios.findOne({where:{email}});

    //si no existe el usuario
    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.redirect('/reestablecer');
    }

    //usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;

    //guardarlos en la db
    await usuario.save();

    //url
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //envia el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'
    })

        //Terminar la ejecucion 
        res.flash('correcto','Se envio un mensaje al correo')
        res.redirect('/iniciar-sesion');
}

exports.validarToken = async (req,res) =>{
    const usuario = await Usuarios.findOne({
        where:{
            token: req.params.token
        }
    });

    //si no encuentra al usuario
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/reestablecer');
    }

    //fomrulario para restablecer
    res.render('resetPassword',{
        nombrePagina: 'Restablecer Contraseña'
    })
}

//cambia el password pòr uno nuevo
exports.actualizarPassword = async (req,res) =>{

    //verifica el token valido y tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where:{
            token: req.params.token,
            expiracion:{
                [Op.gte]: Date.now()
            }
        }
    });
    //Verificar si el usuario existe
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/reestablecer');
    }
    //hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    //guardamos el nuevo password
    await usuario.save();

    req.flash('correcto','Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');
}