import userService from "../services/userService.js";

async function getMe(req, res) {
	res.json(req.user);
}

async function updateMe(req, res, next) {
	try {
		const updated = await userService.update(req.user.id, req.body);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

async function changeMyPassword(req, res, next) {
	try {
		const { currentPassword, newPassword } = req.body;

		await userService.changePassword(req.user.id, currentPassword, newPassword);

		res.json({ message: "Password updated successfully" });
	} catch (err) {
		next(err);
	}
}

async function getPublicProfile(req, res, next) {
	try {
		const user = await userService.findPublicById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json(user);
	} catch (err) {
		next(err);
	}
}

// admin only
async function getAllUsers(req, res, next) {
	try {
		const users = await userService.getAll();
		res.json(users);
	} catch (err) {
		next(err);
	}
}

// admin only
async function deleteUser(req, res, next) {
	try {
		await userService.remove(req.params.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
}

export default {
	getMe,
	updateMe,
	changeMyPassword,
	getPublicProfile,
	getAllUsers,
	deleteUser,
};
