import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN },
	);
}

async function register(req, res, next) {
	try {
		const user = await userService.create(req.body);
		const sanitized = userService.sanitizeUser(user);
		const token = generateToken(sanitized);

		res.status(201).json({
			user: sanitized,
			token,
		});
	} catch (err) {
		next(err);
	}
}

async function login(req, res, next) {
	try {
		const { username, password } = req.body;

		const user = await userService.findByUsername(username);
		if (!user) return res.status(401).json({ message: "Invalid credentials" });

		const valid = await userService.validatePassword(user, password);
		if (!valid) return res.status(401).json({ message: "Invalid credentials" });

		const sanitized = userService.sanitizeUser(user);
		const token = generateToken(sanitized);

		res.json({
			user: sanitized,
			token,
		});
	} catch (err) {
		next(err);
	}
}

export default { register, login };
