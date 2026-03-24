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

async function deleteMe(req, res, next) {
	try {
		await userService.remove(req.user.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
}

async function searchUsers(req, res, next) {
	try {
		const { search } = req.query;

		if (!search || typeof search !== "string") {
			return res.status(400).json({ message: "Search query is required" });
		}

		const users = await userService.searchUsers({
			query: search.trim(),
			currentUserId: req.user.id,
			limit: 15,
		});

		res.json(users);
	} catch (err) {
		next(err);
	}
}

async function getProfile(req, res, next) {
	try {
		const user = await userService.findPublicById(req.params.userId);

		if (!user) return res.status(404).json({ message: "User not found" });
		res.json(user);
	} catch (err) {
		next(err);
	}
}

export default {
	getMe,
	updateMe,
	changeMyPassword,
	searchUsers,
	getProfile,
	deleteMe,
};
