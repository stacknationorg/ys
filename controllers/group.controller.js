// Import Group Model
const Group = require('../models/group.model')


// Create new group with goup_name and group_icon, Required authentication
const createGroup = async (req, res) => {
	
	// User add by authantication middleware, { uid, email }
	// const user = req.user
	
	// Take group_name and group_icon from req.body
	const group_name = req.body.group_name
	const group_icon = req.body.group_icon || 'group_icon.png'

	// Check if group_name is given
	if (!group_name) {
		return res.json({
			error: "Group name is required."
		})
	}

	try {
		
		// Check if group already exist or not
		const _group = await Group.findOne({ group_name })
		if (_group) {
			return res.json({
				error: "Group already exist. Try a different name."
			})
		}

		// Create a new group and save the group in database
		const group = new Group({
			group_name,
			group_icon,
			admin: req.user.uid
			// members: [user.uid],
			// moderators: [user.uid],
		})
		await group.save()
		console.log(group);
		// res.json({
		// 	message: "Group has been created.",
		// })
		
	} catch (error) {
		
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong."
		})
	}
	res.redirect("/groups/grouphome")
}

// Get group info by group_name
const getGroupInfo = async (req, res) => {
	
	// Get required fields from request
	const { name: group_name } = req.params
	const user_id = req.user?.uid

	try {
		// Get group info from database
		const group = await Group.findOne({ group_name }, { __v: 0 })
		if (group) {

			// Return group info as response
			res.json({
				...group._doc,
				members: group.members.length,
				joined: (group.members.indexOf(user_id) !== -1)
			})
		} else {

			// Group does not exist or invalid `group_name`
			res.json({
				error: "Searching for Group."
			})
		}
	} catch(error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong."
		})
	}
}

// Update group info
const updateGroup = async (req, res) => {
	
	// Get required fields from request
	const { name: group_name } = req.params
	const user = req.user

	// Get updatable fields from request body
	const {
		group_name: new_name,
		group_icon: new_icon,
	} = req.body

	try {

		// Get group info from database which is to update
		const group = await Group.findOne({ group_name })
		if (group) {
			// Check if group current user is group adming or not; Can be updated for moderators.
			if (group.admin === user.uid) {

				// Update to group info in the database
				await Group.updateOne(
					{ group_name },
					{
						group_name: (new_name || group.group_name),
						group_icon: (new_icon || group.group_icon)
					}
				)
				res.json({
					message: "Group info updated."
				})
			} else {
				// User is not admin of the group
				res.json({
					error: "Operation not permited"
				})
			}
		}
	} catch(error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong."
		})
	}
}

// Join the group, Required authentication
const joinGroup = async (req, res) => {
	const { name: group_name } = req.params
	const uid = req.user.uid

	try {
		const group = await Group.findOne({ group_name })
		if (group) {
			if (group.admin === uid) {
				res.json({
					error: "Admin can not leave the group."
				})
			
			} else if (group.members.indexOf(uid) !== -1) {
				group.members = group.members.filter(user=>user!==uid)
				await group.save()
			} else {
				group.members.push(uid)
				await group.save()
			}
			console.log(group.members);
			res.redirect("/post/grouptimeline/"+ req.params.name)
		} else {
			res.json({
				error: "Group not found."
			})
		}
	} catch(error) {
		res.json({
			error: "Something went wrong."
		})
	}
}

// Get random 5 groups
const getGroups = async (req, res) => {

	const uid = req.user?.uid
	const POST_PER_PAGE = 5

	try {
		const groups = await Group.find().limit(POST_PER_PAGE)
		res.json(groups.map(group=>({ 
			...group._doc,
			members: group.members.length,
			moderators: group.moderators.length,
			joined: uid ? (
				group.moderators.indexOf(uid) !== -1 || 
				group.members.indexOf(uid) !== -1 ||
				group.admin === uid) 
			: false
		})))
	} catch(error) {
		res.json({
			error: "Something went wrong."
		})
	}
}

// Export functino to use in routes
module.exports = {
	createGroup,
	getGroupInfo,
	updateGroup,
	joinGroup,
	getGroups
}