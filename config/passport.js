const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Referencia al modelo donde vamos autenticas
const Usuarios = require('../models/Usuarios');

//local strategy - Login con credenciales propias usuario y password
passport.use(
    new LocalStrategy(
        //Por default espera un usuario y un password
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async(email,password,done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where:{email:email}
                });
                //El usuario existe, password incorrecto
                if(!usuario.verificarPassword(password)){
                    return done(null,false,{
                        message: 'El password es incorrecto'
                    })
                }
                // el email existe y el password es correcto
                return done(null,usuario);
            } catch (error) {
                //ese usuario no existe
                return done(null,false,{
                    message: 'Esa cuenta no existe'
                })
            }
        }
    )
)

//serializar el usuario
passport.serializeUser((usuario,callback)=>{
    callback(null,usuario);
})

//deserializarlo
passport.deserializeUser((usuario,callback)=>{
    callback(null,usuario);
})

module.exports = passport;