import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

// Create a new user
async function create({
	username,
	password,
	displayName,
	avatarUrl,
	themeColor,
}) {
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			username,
			password: hashedPassword,
			displayName,
			avatarUrl,
			themeColor,
		},
	});

	return sanitizeUser(user);
}

// Internal: find by username
async function findByUsername(username) {
	return prisma.user.findUnique({
		where: { username },
	});
}

// Internal: find by id
async function findById(id) {
	return prisma.user.findUnique({
		where: { id },
	});
}

// Public profile
async function findPublicById(id) {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			username: true,
			displayName: true,
			avatarUrl: true,
			themeColor: true,
			createdAt: true,
		},
	});
}

// Search users (for chat creation)
async function searchUsers({ query, currentUserId, limit = 15 }) {
	const safeLimit = Math.min(limit, 20);

	const users = await prisma.user.findMany({
		where: {
			AND: [
				{
					OR: [
						{
							username: {
								contains: query,
								mode: "insensitive",
							},
						},
						{
							displayName: {
								contains: query,
								mode: "insensitive",
							},
						},
					],
				},
				{
					NOT: {
						id: currentUserId,
					},
				},
			],
		},
		take: safeLimit,
		select: {
			id: true,
			username: true,
			displayName: true,
			avatarUrl: true,
			themeColor: true,
		},
	});

	return users;
}

// Validate password
async function validatePassword(user, password) {
	return bcrypt.compare(password, user.password);
}

// Update user
async function update(id, data) {
	const allowedFields = ["displayName", "avatarUrl", "themeColor"];

	const filteredData = Object.fromEntries(
		Object.entries(data).filter(([key]) => allowedFields.includes(key)),
	);

	const user = await prisma.user.update({
		where: { id },
		data: filteredData,
	});

	return sanitizeUser(user);
}

// Change password
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
	await prisma.user.delete({
		where: { id },
	});

	return;
}

// Sanitize user (remove password)
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
	searchUsers,
	validatePassword,
	update,
	changePassword,
	remove,
	sanitizeUser,
};
