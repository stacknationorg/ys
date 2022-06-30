// Get Access Token
router.post('/refresh_token', (req, res) => {
    try {
        let success = false
        const ref_token = req.cookies.refreshtoken
        if (!ref_token) {
            res.status(400).json({ success, msg: "Please login now" });
        }

        jwt.verify(ref_token, process.env.REFRESH_SECRET, (err, user) => {
            if (err) {
                res.status(400).json({ success, msg: "Please login now" });
            }
            const access_token = createAccessToken({ id: user.id })
            success = true
            res.json({ success, access_token })
        })
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})