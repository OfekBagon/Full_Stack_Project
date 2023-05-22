const express = require('express')
const router = express.Router()
const { ensureAuth, ensureAdmin } = require('../middleware/auth')
const Message = require('../models/Message')

// @desc  Show add page
router.get('/add', ensureAuth, (req, res) => {
    res.render('messages/add') 
})

// @desc  Process the add form
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Message.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc  Show all messages
router.get('/', ensureAuth, async (req, res) => {
    try {
        const statuses = ['public'];
        req.user.isAdmin && statuses.push('private');
        const messages = await Message.find({ status: { $in: statuses } })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        messages.forEach(msg=>{
            msg["like"] = false;
            const idsArray = msg["likes"].map(x => x.toString());
            if(idsArray.includes(req.user.id)){
                msg["like"] = true;
            }
        })
        res.render('messages/index', {
            isAdmin: req.user.isAdmin,
            messages,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc  Show single message
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let message = await Message.findById(req.params.id)
            .populate('user')
            .lean()

        if (!message) {
            return res.render('error/404')
        }

        const sameUser = req.user.id == message.user._id;
        res.render('messages/show', {
            sameUser,
            isAdmin: req.user.isAdmin,
            message
        })
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})


// @desc  Show edit page
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const message = await Message.findOne({
            _id: req.params.id
        }).lean()

        if (!message) {
            return res.render('error/404')
        }

        if (message.user != req.user.id) {
            res.redirect('/messages')
        } else {
            res.render('messages/edit', {
                message,
            })
        }
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc  Update message
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let message = await Message.findById(req.params.id).lean()

        if (!message) {
            return res.render('error/404')
        }

        if (message.user != req.user.id) {
            res.redirect('/messages')
        } else {
            message = await Message.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc  Delete message
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Message.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    User messages
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const messages = await Message.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .lean()
        
        res.render('messages/index', {
            messages: messages,
            isAdmin: req.user.isAdmin,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc  Update like
router.post('/like/:id', ensureAuth, async (req, res) => {

    try {
        let message = await Message.findById(req.params.id);
        let user = req.user
        if (!message) {
            return res.render('error/404')
        }
        if(!message["likes"].includes(user.id)){
            message.likes.push(req.user)
        }else{
            let userIDIndex = message.likes.indexOf(user.id);
            message.likes.pop(userIDIndex);
        }
        await message.save()    
        res.redirect('/messages')

        
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


module.exports = router