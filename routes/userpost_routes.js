
const express = require('express')

const router = express.Router()

const userPost = require('../models/userposts_models')

const User = require('../models/user.model')

// const path = require('path');

var MongoClient = require('mongodb').MongoClient;

router.use(express.static('public'))

const { append } = require("express/lib/response");

const {askQuestion,createPoll, createPost, updatePost, deletePost, getUserPosts, likePost, getLikes, votePoll } = require('../controllers/userpost_controller')
const { authenticate, authorize } = require('../controllers/user.controller')

// router.get('/timeline/:id', authenticate ,function(req,res){
//     const id=req.params.id
//     console.log(id);
//     userPost.find({author:id},function(err,foundposts){
//         // console.log(foundposts);
//         res.render("user-timeline",{posts:foundposts})
//     })
    
// })

router.get('/timeline/:id',authenticate, async (req, res) => {
    const user_id = req.user.uid
    const id = req.params.id
   console.log(user_id);
   const new_user = await User.findById({_id:req.params.id})
   const user_post=await userPost.find({author:req.params.id})
//    console.log(user_post);
//    console.log(new_user);
   res.render('user-timeline',{User:new_user,posts:user_post,login_id:user_id,User_id:id})
   // MongoClient.connect('mongodb://localhost:27017', function(err, client) {
   //     if(err) throw err;
   //     var db =client.db("openDB")
   //     var collection = db.collection('users');
   // 	collection.findOne({_id:id},function(founduser){
   // 		console.log(founduser);
   // 		res.render('user-timeline')
   // 	})
       
   // })
   
})


router.post('/timeline/:id', authenticate , createPost)


router.post("/commentpost/:id", authenticate ,async  function(req,res){
    comnt_body = req.body.comment_body
    post_id = req.body.postid
    console.log(post_id);

    const user = await User.findById({_id:req.user.uid})
    const notify =   user.name + " commented on your Post"
    console.log(notify);
    await User.updateOne(
        {_id:req.params.id},
        {
            $push:{notifications:{notification:notify}}
        }
        )

    userPost.findOne({_id:post_id},function(err,foundOne){
        const objid=foundOne._id
    
        MongoClient.connect('mongodb://localhost:27017', function(err, client) {
        if(err) throw err;
        var db =client.db("openDB")
        var collection = db.collection('userposts');
        collection.updateOne({_id:objid},{ $push:{comments:{cmnt:comnt_body,user:req.user.uid}}})
       

        })
       
        res.redirect("/userpost/timeline/"+ req.params.id)
    })
     
})

router.post("/answerQuest/:id", authenticate ,async function(req,res){
    comnt_body = req.body.ans_body
    post_id = req.body.postid
    console.log(post_id);

    const user = await User.findById({_id:req.user.uid})
    const notify =   user.name + " Answered a Question on Your Timeline"
    console.log(notify);
    await User.updateOne(
        {_id:req.params.id},
        {
            $push:{notifications:{notification:notify}}
        }
        )

    userPost.findOne({_id:post_id},function(err,foundOne){
        const objid=foundOne._id

        MongoClient.connect('mongodb://localhost:27017', function(err, client) {
        if(err) throw err;
        var db =client.db("openDB")
        var collection = db.collection('userposts');
        collection.updateOne({_id:objid},{ $push:{answers:{ans:comnt_body,user:req.user.uid}}})
         
        res.redirect("/userpost/timeline/"+ req.params.id)

        })

    })
     
})
router.post("/answercomment/:ans/:id", authenticate ,async function(req,res){
    comnt_body = req.body.answer_comment
    post_id = req.body.postid
    answer=req.params.ans
    console.log(post_id);
     
    const user = await User.findById({_id:req.user.uid})
    const notify =   user.name + " commented on answer on your Post"
    console.log(notify);
    await User.updateOne(
        {_id:req.params.id},
        {
            $push:{notifications:{notification:notify}}
        }
        )

    userPost.findOne({_id:post_id},function(err,foundOne){
        const objid=foundOne._id

        MongoClient.connect('mongodb://localhost:27017', function(err, client) {
        if(err) throw err;
        var db =client.db("openDB")
        var collection = db.collection('userposts');
        collection.updateOne({_id:objid},{ $push:{ans_comment:{ans:answer,cmnt:comnt_body,user:req.user.uid}}})
         
        res.redirect("/userpost/timeline/"+ req.user.uid)

        })

    })
     
})

router.post('/update/:id', authenticate, function(req,res){
    post_id = req.body.updatepost
    Updated_body = req.body.edited_post
    console.log(post_id);
    userPost.findOne({_id:post_id},function(err,foundOne){
        const objid=foundOne._id
        console.log(objid);
        const name = foundOne.group

        MongoClient.connect('mongodb://localhost:27017', function(err, client) {
        if(err) throw err;
        var db =client.db("openDB")
        var collection = db.collection('userposts');
        collection.updateOne({_id:objid},{$set:{body:Updated_body}})
         
        res.redirect("/userpost/timeline/"+ req.user.uid)

        })

    })
   
})


router.post('/delete/:id', authenticate , function(req,res){
    post_id = req.body.deletepost
    console.log(post_id);
    userPost.findOne({_id:post_id},function(err,foundOne){
        const objid=foundOne._id
        const name = foundOne.group

        MongoClient.connect('mongodb://localhost:27017', function(err, client) {
        if(err) throw err;
        var db =client.db("openDB")
        var collection = db.collection('userposts');
        collection.deleteOne({_id:objid})
         
        res.redirect("/userpost/timeline/"+ req.user.uid)

        })

    })
   
})

// Done
router.post('/createPolls/:id', authenticate, createPoll) 


router.post('/like/:id', authenticate, likePost)

// Done
router.post('/vote/:id/:option', authenticate, votePoll)


router.post("/askQuestion/:id",authenticate,askQuestion)


router.get('/like/:id', authorize, getLikes)

router.get('/user/:id', authorize, getUserPosts)

module.exports = router