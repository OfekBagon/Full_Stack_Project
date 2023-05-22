const GoogleStartegy = require('passport-google-oauth20').Strategy 
const mongoose = require('mongoose') 
const User = require('../models/User') 

module.exports = function(passport) { 
    passport.use(new GoogleStartegy({ 
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async(accessToken, refreshToken, profile, done) => {
        const newUser = {  // That will give us a new user object that we want to store in database
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
        try{ 
            let user = await User.findOne({googleId: profile.id})
            if(user){ // if user exist
                done(null, user)
            } else { // if no user - we want to create one 
                user = await User.create(newUser)
                done(null, user)
            }
        }catch(err){
            console.error(err)
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
      
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })

}
