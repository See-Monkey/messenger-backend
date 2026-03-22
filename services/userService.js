import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

// Create a new user
async function create({ username, password, firstname, lastname, avatarUrl }) {
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			username,
			password: hashedPassword,
			firstname,
			lastname,
			role: "USER",
			avatarUrl,
		},
	});

	return sanitizeUser(user);
}

// Find user by username - Internal
async function findByUsername(username) {
	return prisma.user.findUnique({
		where: { username },
	});
}

// Find by user ID - Internal
async function findById(id) {
	return prisma.user.findUnique({
		where: { id },
	});
}

// Find sanitized user for profile display
async function findPublicById(id) {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			username: true,
			firstname: true,
			lastname: true,
			avatarUrl: true,
			createdAt: true,
		},
	});
}

// Validate user password
async function validatePassword(user, password) {
	return bcrypt.compare(password, user.password);
}

// Update user data
async function update(id, data) {
	// Whitelist allowed fields
	const allowedFields = ["firstname", "lastname", "avatarUrl"];

	const filteredData = Object.fromEntries(
		Object.entries(data).filter(([key]) => allowedFields.includes(key)),
	);

	const user = await prisma.user.update({
		where: { id },
		data: filteredData,
	});

	return sanitizeUser(user);
}

// Change Password
async function changePassword(id, currentPassword, newPassword) {
	const user = await findById(id);
	if (!user) throw new Error("User not found");

	const valid = await bcrypt.compare(currentPassword, user.password);
	if (!valid) throw new Error("Current password incorrect");

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	const updated = await prisma.user.update({
		where: { id },
		data: { password: hashedPassword },
	});

	return sanitizeUser(updated);
}

// Delete user
async function remove(id) {
	const user = await prisma.user.delete({
		where: { id },
	});

	return sanitizeUser(user);
}

// Get all users
async function getAll() {
	return prisma.user.findMany({
		select: {
			id: true,
			username: true,
			firstname: true,
			lastname: true,
			role: true,
			createdAt: true,
		},
	});
}

// Remove password field before returning user
function sanitizeUser(user) {
	if (!user) return null;
	const { password, ...safeUser } = user;
	return safeUser;
}

export default {
	create,
	findByUsername,
	findById,
	findPublicById,
	validatePassword,
	update,
	changePassword,
	remove,
	getAll,
	sanitizeUser,
};
