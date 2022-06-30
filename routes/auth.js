const express = require('express');
const User = require('../models/UserModel');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sendEmail = require('../controllers/sendMail');
const authUser = require('../middleware/authUser');

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_SECRET, { expiresIn: '5m' })
}

// ROUTE 1: Create a user using : POST "/api/auth/createuser"
router.post('/createuser', async (req, res) => {
    try {
        // Check whether the user with this email exists already
        let success = false
        const { fname, lname, email, password } = req.body

        let user = await User.findOne({ email });
        if (user) {
            req.flash("error", "Please enter a unique email")
            return res.redirect('/register')
        }

        if (password.length < 5) {
            req.flash("error", "Password must be atleast 5 characters")
            return res.redirect('/register')
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        // Create a new user
        user = ({
            firstname: fname,
            lastname: lname,
            email: email,
            password: secPass
        })

        const activation_token = createActivationToken(user)
        const url = `${process.env.CLIENT_URL}/api/auth/user/activate/${activation_token}`
        sendEmail(email, url)
        success = true;
        req.flash("success", "Register Success! Please verify your email to start.")
        res.redirect('/register')
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})


// ROUTE 2: Verify email address using: POST "/api/auth/verification"
router.get('/user/activate/:token', async (req, res) => {
    try {
        let success = false;
        const activation_token = req.params.token
        const user = jwt.verify(activation_token, process.env.ACTIVATION_SECRET)
        const { firstname, lastname, email, password } = user

        // Create and save user
        const newUser = User.create({
            firstname, lastname, email, password
        })

        success = true

        req.flash("success", "Account has been activated! Please login.")
        return res.redirect('/login')
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

// ROUTE 3: Authenticate a user using: POST "/api/auth/login"
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Try to login with correct credentials')
            return res.redirect('/login')
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            req.flash('error', 'Try to login with correct credentials')
            return res.redirect('/login')
        }
        const token = jwt.sign({ data: user }, process.env.ACCESS_SECRET, { expiresIn: '24h' })

        res.cookie("token", token, {
            httpOnly: true
        })
        req.flash("success", "Logged in successfully")
        return res.redirect('/dashboard')
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
})

// Update User Details
router.patch('/update', authUser, async (req, res) => {
    try {
        const userId = req.user.data._id;
        // console.log(req.body);
        const { firstname, lastname, email, gender, occupation, interests } = req.body
        // const { date, month, year } = req.body.dob
        // const education = req.body.education
        // const employement = req.body.employement
        // const socialNetworks = req.body.socialNetworks

        let user = await User.findOneAndUpdate({ _id: userId }, {
            firstname, lastname, email,
            gender, occupation, interests
        })
        console.log(user);
        // req.flash('success', 'Details updated')
        return res.redirect('/dashboard')
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

// Log Out
router.get('/logout', async (req, res) => {
    try {
        res.clearCookie("token")
        req.flash("success", "Logged out successfully.")

        return res.redirect('/')
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

// Fetch Logged in User Details
router.post('/getuser', authUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

// Fetch User by ID
router.get('/getuser/:id', async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select("-password");
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})
module.exports = router;