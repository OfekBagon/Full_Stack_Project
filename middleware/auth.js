module.exports = { 
    ensureAuth: function(req,res,next) {
        if(req.isAuthenticated()) { 
            return next() 
        }
        else{
            res.redirect('/') 
        }
    },
    ensureAdmin: function(req,res,next) {
        if(req.isAuthenticated()&&req.user.isAdmin) { 
            return next() 
        }
        else{
            res.redirect('/') 
        }
    },
    ensureGuest: function(req,res,next) { 
        if(req.isAuthenticated()) {
            res.redirect('/dashboard') 
        }
        else{
            return next()
        }
    }
}