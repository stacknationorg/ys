// Import Post Model
const userPost = require('../models/userposts_models')

// Create a new post with required fields
const createPost = async (req, res) => {
	
	// Get required fields from request
	// const user = req.user
	const body = req.body.body
	const options = req.body.options || []
	const type = req.body.type || 'normal'
	const ref = req.body.ref || null
	const external_link = req.body.external_link
	
	const likes = []

	// console.log(group);
	
	// For later admin use
	const is_sponsored = false

	// Check if post body provided in request body
	if (!body) {
		return res.json({
			error: "Post must have a body."
		})
	}

	// Check if type is poll and has atleast two option to chose
	// if (type === 'poll' && options.length <= 1) {
	// 	return res.json({
	// 		error: "Poll should have atleast 2 or more options."
	// 	})
	// }

	try {
		// Create a new post from given data and save it in the databaes, Return new post as response
		const post = new userPost({
			body,
			ref,
			external_link,
			is_sponsored,
			likes,
			author:req.user.uid,
			type,
			options,
		})
		// console.log(post);
		if (type === 'poll') {
			post.submissions = new Map()
			const map = new Map()
		}
		await post.save()
		// res.json({
		// 	message: "Post created successfully",
		// 	payload: post
		// })
	} catch (error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong.",
			payload: error
		})
	}
	res.redirect("/userpost/timeline/"+ req.params.id )
}

// Like a post from post_id, Required authentication
const likePost = async (req, res) => {

	// Get required fields from request
	const user_id = req.user.uid
	const { id: post_id } = req.params

	// Post id is required to like a post
	if (!post_id) {
		return res.json({
			error: "Missing post id in params"
		})
	}

	try {
		// Get post info from database with post_id
		const post = await userPost.findById(post_id)
		if (post) {

			// Add current user to posts likes if not exist, save the updated post
			if (post.likes.indexOf(user_id) !== -1) {
				post.likes = post.likes.filter(user => user !== user_id)
				await post.save()
				// res.json({
				// 	message: 'Post disliked.',
				// 	liked: false
				// })
			} else {
				post.likes.push(user_id)
				await post.save()
				// res.json({
				// 	message: "Post liked.",
				// 	liked: true
				// })
			}
			res.redirect("/userpost/timeline/"+ post.author)
		} else {
			return res.json({
				error: "Post not found.",
			})
		}
	} catch (error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong.",
			payload: error
		})
	}
}

// Get posts from users timeline
const getUserPosts = async (req, res) => {
	
	// Get required field from request
	const { id: user_id } = req.params
	const { page } = req.query || 1

	const POST_PER_PAGE = 10

	// Calculate offset based on page number
	const offset = ((Math.max(page, 1) - 1) * POST_PER_PAGE)

	try {
		// Get Post and Post count from database and return as response
		const total = await Post.find({ author: user_id }).count()
		const posts = await Post.find({ author: user_id }).skip(offset).limit(POST_PER_PAGE)
		res.json({
			total_page: Math.ceil(total / POST_PER_PAGE),
			posts: posts.map(post=>({ ...post._doc, likes: post.likes.length }))
		})
	} catch (error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong."
		}) 
	}
}

// Update the post, Required authentication
const updatePost = async (req, res) => {
	// Get required fields from request
	const user = req.user
	const { id: post_id } = req.params
	const {
		body,
		external_link,
		type,
	} = req.body
	const options = req.body.options || []

	if (!post_id) {
		return res.json({
			error: "Post id missing in params"
		})
	}

	if (type === 'poll' && options.length <= 1) {
		return res.json({
			error: "Poll should have atleast 2 or more options."
		})
	}

	try {
		// Get Post from database and update post
		const post = await Post.findById(post_id)
		// Check if user is author of the post
		if (post.author === user.uid) {
			// Create filter to get post by its id
			const filter = { _id: post_id }
			const update = {
				body,
				external_link,
				type,
				last_update: Date.now()
			}
			await Post.updateOne(filter, update)
			if (type === 'poll') {
				post.submissions = new Map()
				await post.save()
			}
			res.json({
				message: "Post has been updated.",
			})
		} else {
			res.json({
				error: "Operation not permited."
			})
		}
	} catch (error) {
		res.json({
			error: "Something went wrong."
		})
	}
}

// Delete the post, Required authentication
const deletePost = async (req, res) => {
	// Get required fields from request
	const { id: post_id } = req.params
	const { uid: user_id } = req.user

	try {
		// Find the post and delete if current user is the author
		const post = await Post.findById(post_id)
		if (post) {
			if (post.author === user_id) {
				await Post.deleteOne({ _id: post_id })
				res.json({
					message: "Post deleted successfully"
				})
			} else {
				res.json({
					error: "Operation not permited."
				})
			}
		}
	} catch (error) {
		res.json({
			error: "Something went wrong."
		})
	}
}

// Get information about likes of any post
const getLikes = async (req, res) => {
	// Get required fields from request
	const { id: post_id } = req.params
	const user_id = req.user?.uid
	try {
		// Find post by id and calculate likes
		const post = await Post.findById(post_id)
		res.json({
			likes: post.likes.length,
			likeked: post.likes.indexOf(user_id) !== -1
		})
	} catch(error) {
		res.json({
			error: "Something went wrong."
		})
	}
}

// Vote an poll by id, Required authentication, Post must be of type poll
const votePoll = async (req, res) => {
	// Get required fields from request
	const { id: post_id, option } = req.params
	const uid = req.user.uid

	// Find the post
	const post = await userPost.findById(post_id)
     console.log(post); 
	
	// Check if post is of type poll
	if (post.type === 'poll') {
		// Check if option is valid option or not
		if (post.options.indexOf(option) !== -1) {
			// Check if user already submitted a response
			if (post.submissions.has(uid)) {
				// If reponse exist and selected option is current option delete the reponse
				if (post.submissions.get(uid) === option) {
					post.submissions.delete(uid)
					await post.save()
					// res.json({
					// 	message: "Response has been removed"
					// })
				} else {
					// If reponse doese not exist update the option
					post.submissions.set(uid, option)
					await post.save()
					// res.json({
					// 	message: "Response has been updated."
					// })
				}
			} else {
				post.submissions.set(uid, option)
				await post.save()
				// res.json({
				// 	message: "Response has been submitted"
				// })
			}
		} else {
			res.json({
				error: "Invalid poll option"
			})
		}
	} else {
		res.json({
			error: "Post is not a poll."
		})
	}
	res.redirect("/userpost/timeline/"+ req.user.uid)
}

const createPoll = async (req, res) => {
	
	// Get required fields from request
	// const user = req.user
	const body = req.body.poll_quest
	const options = [req.body.option1,req.body.option2,req.body.option3] || []
	const type = req.body.type || "poll"
	const ref = req.body.ref || null
	const external_link = req.body.external_link
	
	const likes = []

	
	// For later admin use
	const is_sponsored = false

	// Check if post body provided in request body
	// if (!body) {
	// 	return res.json({
	// 		error: "Post must have a body."
	// 	})
	// }

	// Check if type is poll and has atleast two option to chose
	if (type === 'poll' && options.length <= 1) {
		return res.json({
			error: "Poll should have atleast 2 or more options."
		})
	}

	try {
		// Create a new post from given data and save it in the databaes, Return new post as response
		const post = new userPost({
			body,
			ref,
			external_link,
			is_sponsored,
			likes,
			author:req.user.uid,
			type,
			options,
		})
		// console.log(post);
		if (type === 'poll') {
			post.submissions = new Map()
			const map = new Map()
		}
		await post.save()
		// res.json({
		// 	message: "Post created successfully",
		// 	payload: post
		// })
	} catch (error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong.",
			payload: error
		})
	}
	res.redirect("/userpost/timeline/"+ req.user.uid)
}

const askQuestion = async (req, res) => {
	
	// Get required fields from request
	// const user = req.user
	const body = req.body.quest
	
	const type = req.body.type || "question"
	const ref = req.body.ref || null
	const external_link = req.body.external_link
	
	
	const likes = []

	
	
	// For later admin use
	const is_sponsored = false

	// Check if post body provided in request body
	// if (!body) {
	// 	return res.json({
	// 		error: "Post must have a body."
	// 	})
	// }

	// Check if type is poll and has atleast two option to chose
	// if (type === 'poll' && options.length <= 1) {
	// 	return res.json({
	// 		error: "Poll should have atleast 2 or more options."
	// 	})
	// }

	try {
		// Create a new post from given data and save it in the databaes, Return new post as response
		const post = new userPost({
			body,
			ref,
			external_link,
			is_sponsored,
			likes,
			author:req.user.uid,
			type
		})
		// console.log(post);
		// if (type === 'poll') {
		// 	post.submissions = new Map()
		// 	const map = new Map()
		// }
		await post.save()
		// res.json({
		// 	message: "Post created successfully",
		// 	payload: post
		// })
	} catch (error) {
		// Something went wrong with server, Use `error` as payload if required
		res.json({
			error: "Something went wrong.",
			payload: error
		})
	}
	res.redirect("/userpost/timeline/"+ req.user.uid)
}

module.exports = {
	askQuestion,
	createPoll,
	createPost,
	updatePost,
	likePost,
	deletePost,
	getUserPosts,
	getLikes,
	votePoll,
}