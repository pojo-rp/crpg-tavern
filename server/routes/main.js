const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET
// HOME

router.get('', async (req, res) => {
    try {
        let latest = 4;
        const latestPost = await Post.aggregate([{ $sort: {createdAt: -1}}]).limit(latest);

        res.render('index', {
            currentRoute: '/',
            latestPost
        });
        
    } catch (error) {
        console.log(error);
    }
    
});

router.get('/database', (req, res) => {
    res.render('database');
});

router.get('/news', async (req, res) => {

    try{
        let perPage = 10;
        let page = req.query.page || 1;   

        const allPost = await Post.aggregate([{ $sort: {createdAt: -1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage);

        res.render('news', {allPost, current: page, nextPage: hasNextPage? nextPage : null, currentRoute: '/news'});   
    }
    catch(error){
        console.log(error);
    }
    
});
router.get('/contact', (req, res) => {
    res.render('contact', {currentRoute: '/contact'});
});

router.post('/contact', async (req, res) => {
    try {
        const {name, email, phone, message} = req.body;

        if(!name || !email || !message){
            return res.status(400).json({status: 'error', message:'Missing field'});
        }

        console.log(name + '\n' + email + '\n' + message + '\n' + phone);
        return res.status(200).json({status: 'success', message: 'Email successfully sent'});

        res.redirect('/contact');
    
    } catch (error) {
        console.log(error);
    }
});

router.get('/join', (req, res) => {
    res.render('join', {currentRoute: '/join'});
});


// function insertPostData(){
//     Post.insertMany([
//         {
//             title: "Latest crpgs released",
//             body: "New crpgs are releasing daily"
//         },
//     ])
// }

// insertPostData();

// GET post:id

router.get('/post/:id/:postTitle', async (req, res) => {
    try {
        let postId = req.params.id;
        

        const data = await Post.findById({_id: postId});
        let pTitle = data.title;

        const metaimg = data.imgPath;
        const nextPost = await Post.findOne({createdAt:{$gt: data.createdAt}}).sort({createdAt: 1});
        const prevPost = await Post.findOne({createdAt:{$lt: data.createdAt}}).sort({createdAt: -1});

        res.render('post', {data, nextPost, prevPost, currentRoute:`/post/$(pTitle)/$(postId)`, metaimg: metaimg, title: pTitle});
        
    } catch (error) {
        console.log(error);
    }
    
});

// POST searchterm

router.post('/search', async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        const searchClean = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                {title: {$regex: new RegExp(searchClean, 'i') }},
                {body: {$regex: new RegExp(searchClean, 'i') }}
            ]
        })


        res.render('searchpage',{
            data
        });
        
    } catch (error) {
        console.log(error);
    }
    
});



module.exports = router;