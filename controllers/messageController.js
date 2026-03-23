import messageService from "../services/messageService.js";

async function createMessage(req, res, next) {
	try {
		const { chatId } = req.params;
		const { content } = req.body;

		const message = await messageService.createMessage({
			chatId,
			senderId: req.user.id,
			content,
		});

		res.status(201).json(message);
	} catch (err) {
		next(err);
	}
}

async function editMessage(req, res, next) {
	try {
		const { messageId } = req.params;
		const { content } = req.body;

		const updatedMessage = await messageService.editMessage({
			messageId,
			userId: req.user.id,
			content,
		});

		res.json(updatedMessage);
	} catch (err) {
		next(err);
	}
}

async function deleteMessage(req, res, next) {
	try {
		const { messageId } = req.params;

		await messageService.deleteMessage({
			messageId,
			userId: req.user.id,
		});

		res.status(204).end();
	} catch (err) {
		next(err);
	}
}

export default {
	createMessage,
	editMessage,
	deleteMessage,
};
