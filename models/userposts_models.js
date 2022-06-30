const mongoose = require('mongoose')
const userpostSchema = new mongoose.Schema({
	author:{
		type:String,
		default:"Logged In User"
	},			// Author id
	body: String,           // Content of post
	comments:[
		{user:{
			type:String,
			default:"Commenting User"
		},
		cmnt:String,
		commented_on: {	
			type: Date,
			default: Date.now
		}
	    }
	],
	answers:[
		{user:{
			type:String,
			default:"Answering User"
		},
		ans:String,
		answered_on: {	
			type: Date,
			default: Date.now
		}
		}
	],
	ans_comment:[
		{
			user:{
				type:String,
				default:"Commenting User"
			},
			ans:String,
			cmnt:String,
			commented_on: {	
				type: Date,
				default: Date.now
			}	
		}
	
	],
	ref: String,			// Id of reference post if any
	is_sponsored: Boolean,	// Post is sponsored or not, For admin use
	external_link: String,	// External link
	type: String,			// Type of the post poll, que, ans or normal
	options: [String],		// List of options, When post type is `poll`
	submissions: Map,		// Map of user and his response
	likes: [String],		// List of user that liked this post
	last_update: {			// Date post last updated
		type: Date,
		default: Date.now,
	},
	created_on: {			// Date post created
		type: Date,
		default: Date.now
	},
})
module.exports = mongoose.model('userPost', userpostSchema)