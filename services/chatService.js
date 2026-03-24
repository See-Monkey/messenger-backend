import { prisma } from "../config/prisma.js";

async function getUserChats(userId, { cursor, limit = 20 }) {
	return prisma.chat.findMany({
		where: {
			chatMembers: {
				some: { userId },
			},
		},
		orderBy: {
			updatedAt: "desc",
		},
		take: limit,
		...(cursor && {
			skip: 1,
			cursor: { id: cursor },
		}),
		include: {
			chatMembers: {
				include: {
					user: {
						select: {
							id: true,
							username: true,
							displayName: true,
							avatarUrl: true,
						},
					},
				},
			},
			messages: {
				orderBy: { createdAt: "desc" },
				take: 1,
			},
		},
	});
}

async function createChat({ currentUserId, userIds = [], name }) {
	// ensure creator is included
	const uniqueUserIds = [...new Set([currentUserId, ...userIds])];

	const isGroup = uniqueUserIds.length > 2;

	return prisma.chat.create({
		data: {
			name: isGroup ? name : null,
			isGroup,
			createdById: currentUserId,
			chatMembers: {
				create: uniqueUserIds.map((userId) => ({
					userId,
				})),
			},
		},
		include: {
			chatMembers: {
				include: {
					user: {
						select: {
							id: true,
							username: true,
							displayName: true,
							avatarUrl: true,
						},
					},
				},
			},
		},
	});
}

async function getChatById(chatId, userId, { cursor, limit = 50 } = {}) {
	const chat = await prisma.chat.findFirst({
		where: {
			id: chatId,
			chatMembers: {
				some: { userId },
			},
		},
		include: {
			chatMembers: {
				include: {
					user: {
						select: {
							id: true,
							username: true,
							displayName: true,
							avatarUrl: true,
						},
					},
				},
			},
			messages: {
				orderBy: { createdAt: "desc" }, // newest first
				take: limit,
				...(cursor && {
					skip: 1,
					cursor: { id: cursor },
				}),
			},
		},
	});

	return chat;
}

async function editChat({ chatId, name }) {
	if (!name || name.trim() === "") {
		throw new Error("Chat name cannot be empty");
	}

	const updatedChat = await prisma.chat.update({
		where: { id: chatId },
		data: { name },
	});

	return updatedChat;
}

async function addUserToChat({ chatId, currentUserId, userIdToAdd }) {
	const membership = await prisma.chatMember.findUnique({
		where: {
			userId_chatId: {
				userId: currentUserId,
				chatId,
			},
		},
	});

	if (!membership) {
		throw new Error("Not authorized to modify this chat");
	}

	await prisma.chatMember.upsert({
		where: {
			userId_chatId: {
				userId: userIdToAdd,
				chatId,
			},
		},
		update: {},
		create: {
			chatId,
			userId: userIdToAdd,
		},
	});

	// count members
	const memberCount = await prisma.chatMember.count({
		where: { chatId },
	});

	await prisma.chat.update({
		where: { id: chatId },
		data: {
			updatedAt: new Date(),
			isGroup: memberCount > 2,
		},
	});

	return getChatById(chatId, currentUserId);
}

async function removeUserFromChat({ chatId, userId }) {
	await prisma.chatMember.delete({
		where: {
			userId_chatId: {
				userId,
				chatId,
			},
		},
	});

	const memberCount = await prisma.chatMember.count({
		where: { chatId },
	});

	await prisma.chat.update({
		where: { id: chatId },
		data: {
			isGroup: memberCount > 2,
			updatedAt: new Date(),
		},
	});
}

export default {
	getUserChats,
	getChatById,
	createChat,
	editChat,
	addUserToChat,
	removeUserFromChat,
};
