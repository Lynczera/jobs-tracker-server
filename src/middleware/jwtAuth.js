var jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports.jwtAuth = {

	//creates the token	
	sign: (user) => {
		return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" })
	},

	//verifies the token 
	verify: (req, res, token) => {
		try {
			const user = jwt.verify(token, process.env.JWT_SECRET);
			req.user = user
			return true

		} catch (e) {
			res.clearCookie("token");
			return false

		}

	}

};
