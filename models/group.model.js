const mongoose = require('mongoose')
const groupSchma = new mongoose.Schema({
	group_name: String,		// Group name
	group_icon: String,		// Group Icon
	admin: String,			// Id of Group Admin
	moderators: [String],	// List of moderators
	members: [String],		                // List of joined members
	created_on: {			// Date group created
		type: Date,
		default: Date.now
	}
})
module.exports = mongoose.model('Group', groupSchma)