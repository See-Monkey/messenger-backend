import { prisma } from "../config/prisma.js";

async function createMessage({ chatId, senderId, content }) {
	return prisma.$transaction(async (tx) => {
		const membership = await tx.chatMember.findUnique({
			where: {
				userId_chatId: {
					userId: senderId,
					chatId,
				},
			},
		});

		if (!membership) {
			throw new Error("Not authorized to send messages in this chat");
		}

		const message = await tx.message.create({
			data: {
				chatId,
				senderId,
				content,
			},
		});

		await tx.chat.update({
			where: { id: chatId },
			data: { updatedAt: new Date() },
		});

		return message;
	});
}

async function editMessage({ messageId, userId, content }) {
	const message = await prisma.message.findUnique({
		where: { id: messageId },
	});

	if (!message) {
		throw new Error("Message not found");
	}

	if (message.senderId !== userId) {
		throw new Error("Not authorized to edit this message");
	}

	if (message.deletedAt) {
		throw new Error("Cannot edit a deleted message");
	}

	return prisma.message.update({
		where: { id: messageId },
		data: {
			content,
			editedAt: new Date(),
		},
	});
}

async function deleteMessage({ messageId, userId }) {
	const message = await prisma.message.findUnique({
		where: { id: messageId },
	});

	if (!message) {
		throw new Error("Message not found");
	}

	if (message.senderId !== userId) {
		throw new Error("Not authorized to delete this message");
	}

	await prisma.message.update({
		where: { id: messageId },
		data: {
			deletedAt: new Date(),
			content: "",
		},
	});

	return;
}

export default {
	createMessage,
	editMessage,
	deleteMessage,
};
