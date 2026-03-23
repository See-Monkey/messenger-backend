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

async function getChatById(chatId, userId, { cursor, limit = 50 }) {
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

async function addUserToChat({ chatId, currentUserId, userIdToAdd }) {
	// ensure current user is in chat
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

	// add user (will fail if already exists due to unique constraint)
	await prisma.chatMember.create({
		data: {
			chatId,
			userId: userIdToAdd,
		},
	});

	// update chat timestamp
	await prisma.chat.update({
		where: { id: chatId },
		data: { updatedAt: new Date() },
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

	return;
}

export default {
	getUserChats,
	getChatById,
	createChat,
	addUserToChat,
	removeUserFromChat,
};
