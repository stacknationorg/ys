const express = require('express')

const router = express.Router()

const Group = require('../models/group.model')
const User = require('../models/user.model')



router.use(express.static('public'))
const { append } = require("express/lib/response");

const { createGroup, getGroupInfo, updateGroup, joinGroup, getGroups } = require('../controllers/group.controller')
const { authenticate, authorize } = require('../controllers/user.controller')


// router.get('/random',  getGroups)
// router.get('/:name',  getGroupInfo)

// router.get('/create',function(req,res){
//     res.render("user-groups")
// })


 
router.get('/grouphome/:id',authenticate,async function(req,res){
    const User_id=req.params.id
    // if(req.user.uid){
    //     login_id=req.user.uid
    // }
    // else{
    //     login_id=0
    // }
    const login_id=req.user.uid


    const user = await User.findById({_id:User_id})
    console.log(login_id,user._id);
        
            Group.find({admin:User_id},function(err,foundgroups){
                res.render("user-groups",{groups:foundgroups,User:user,LOG_user:login_id})  
              })
       
    
    // console.log(logged_in_user);

})


router.get("/followers/:name",async function(req,res){
	const name = req.params.name
	const group = await Group.findOne({group_name:name})
	console.log(group);
	res.render("group-followers",{grroup:group})
})


router.post('/creategroup',authenticate,createGroup)




router.post('/update/:name',  updateGroup)
router.post('/join/:name', authenticate,  joinGroup)

module.exports = router