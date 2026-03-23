import chatService from "../services/chatService.js";

async function getChats(req, res, next) {
	try {
		const chats = await chatService.getUserChats(req.user.id);
		res.json(chats);
	} catch (err) {
		next(err);
	}
}

async function getChatById(req, res, next) {
	try {
		const { chatId } = req.params;

		const chat = await chatService.getChatById(chatId, req.user.id);

		if (!chat) {
			return res.status(404).json({ message: "Chat not found" });
		}

		res.json(chat);
	} catch (err) {
		next(err);
	}
}

async function createChat(req, res, next) {
	try {
		const { userIds = [], name } = req.body;

		const chat = await chatService.createChat({
			currentUserId: req.user.id,
			userIds,
			name,
		});

		res.status(201).json(chat);
	} catch (err) {
		next(err);
	}
}

async function addUser(req, res, next) {
	try {
		const { chatId } = req.params;
		const { userId } = req.body;

		const updatedChat = await chatService.addUserToChat({
			chatId,
			currentUserId: req.user.id,
			userIdToAdd: userId,
		});

		res.json(updatedChat);
	} catch (err) {
		next(err);
	}
}

async function removeMe(req, res, next) {
	try {
		const { chatId } = req.params;

		await chatService.removeUserFromChat({
			chatId,
			userId: req.user.id,
		});

		res.status(204).end();
	} catch (err) {
		next(err);
	}
}

export default {
	getChats,
	getChatById,
	createChat,
	addUser,
	removeMe,
};
