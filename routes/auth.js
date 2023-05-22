// created route to use the googlestrategy from passport.js
const express = require('express')
const passport = require('passport')
const router = express.Router()

// @desc  Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile']}))

// @desc  Google Auth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req,res){
        res.redirect('/dashboard')
    }
)

// @desc Logout user
router.get('/logout', (req,res) => {
    req.logout() // request logout object
    res.redirect('/')
})

module.exports = router