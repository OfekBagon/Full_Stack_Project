const express = require('express')
const router = express.Router()
const { ensureAuth, ensureAdmin } = require('../middleware/auth')
const Message = require('../models/Message')
const User = require('../models/User')



router.get('/', ensureAuth, async (req, res)=> { // to get our main layout dashboard in views
    try{

        const statuses = ['public'];
        req.user.isAdmin && statuses.push('private');
        const messages = await Message.find({ status: { $in: statuses } })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()
    
        // pass in data in to a handlebars tamplate and render.
        res.render('admin', {
            fname: req.user.firstName,
            lname: req.user.lastName,
            isAdmin: req.user.isAdmin,
            messages
        })
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
})

router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Message.remove({ _id: req.params.id })
        res.redirect('/admin')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router