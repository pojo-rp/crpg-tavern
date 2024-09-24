const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const fs = require('fs');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: './public/img/',
    filename: (req,file,cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// String to HTML
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Check Login

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.redirect('admin');
    }
    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error){
        return res.redirect('admin');
    }
}

// GET
// ADMIN - LOGIN PAGE


router.get('/admin', async (req, res) => {
    try {
    
        const locals = {
            title: "Admin"
        }


        res.render('admin/index', {locals, layout: adminLayout});
        
    } catch (error) {
        console.log(error);
    }
    
    
});

router.post('/admin', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({ username});

        if(!user){
            return res.status(401).json({message : 'Invalid Credentials'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({message : 'Invalid Credentials'});
        }

        const token = jwt.sign({userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});

        res.redirect('/dashboard');
        
    } catch (error) {
        console.log(error);
    }
    
});

// Admin Dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const data = await Post.aggregate([{ $sort: {createdAt: -1 }}]);

        res.render('admin/dashboard', {data, layout: adminLayout});
        
    } catch (error) {
        console.log(error);
    }
    
});

/**
 * GET /
 * Admin - Create New Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Add Post',
        description: 'Add post for admin'
      }
  
      const data = await Post.find();
      res.render('admin/add-post', {
        locals,
        layout: adminLayout
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
/**
 * POST /
 * Admin - Create New Post
 */
router.post('/add-post', authMiddleware, upload.single('title-image'), async (req, res) => {
try {
    try {
    const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        imgPath: req.file.originalname
    });

    await Post.create(newPost);
    
    res.redirect('/dashboard');
    } catch (error) {
    console.log(error);
    }

} catch (error) {
    console.log(error);
}
});
  
  
/**
 * GET /
 * Admin - Create New Post
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
try {

    const locals = {
    title: "Edit Post",
    description: "Edit Post for admin",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
    locals,
    data,
    layout: adminLayout
    })

} catch (error) {
    console.log(error);
}

});
  

/**
 * PUT /
 * Admin - Create New Post
 */
router.put('/edit-post/:id', authMiddleware, upload.single('title-image'), async (req, res) => {
    try {
        const editedPost = await Post.findById(req.params.id);
        const filePath = 'public/img/' + editedPost.imgPath;

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
            imgPath: req.file.originalname
        });

        fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          
            console.log(`File ${filePath} has been successfully removed.`);
        });

        res.redirect(`/dashboard`);

    } catch (error) {
        console.log(error);
    }

    });

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        const deletePost = await Post.findById({_id: req.params.id});
        const deleteImg = deletePost.imgPath;

        const filePath = 'public/img/' + deleteImg;

        fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          
            console.log(`File ${filePath} has been successfully removed.`);
        });

        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    
    } catch (error) {
        console.log(error);
    }
    
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({message: 'Logout Successful'});
    res.redirect('/admin');
});




module.exports = router;