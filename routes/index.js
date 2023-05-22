const express = require('express') // will be using the express router
const router = express.Router() // set it
const {ensureAuth, ensureGuest, ensureAdmin} = require('../middleware/auth') 
const Message = require('../models/Message') 
const User = require('../models/User')


// in our main layout! 
// @desc  Login/Landing page
router.get('/', ensureGuest, (req, res)=> { // ensureGuest - only someone who's NOT signed in should see this
    res.render('login',{  
        layout:'login', 
    })
})

// @desc  Dashboard page
router.get('/dashboard', ensureAuth, async (req, res)=> { // will get our main layout dashboard in views
    try{
        const messages = await Message.find({ user: req.user.id }).lean() 
        res.render('dashboard', {
            isAdmin: req.user.isAdmin,
            fname: req.user.firstName,
            lname: req.user.lastName,
            messages
        })
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
})


// @desc    delete user
router.delete('/user/:userId', ensureAdmin, async (req, res) => {
    try {
        if(req.params.userId == req.user._id){
            res.render('error/500')
            return
        }
        await Message.deleteMany({user:req.params.userId});
        await User.findByIdAndDelete(req.params.userId);
        res.redirect('/dashboard');
    }catch(err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router // export this file