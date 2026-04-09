import chatService from "../services/chatService.js";

async function getChats(req, res, next) {
  try {
    const { cursor, limit } = req.query;

    const safeLimit = Math.min(Number(limit) || 20, 50);

    const chats = await chatService.getUserChats(req.user.id, {
      cursor,
      limit: safeLimit,
    });

    res.json({
      data: chats,
      nextCursor: chats.length ? chats[chats.length - 1].id : null,
    });
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

async function getChatById(req, res, next) {
  try {
    const { chatId } = req.params;
    const { cursor, limit } = req.query;

    const safeLimit = Math.min(Number(limit) || 50, 100);

    const chat = await chatService.getChatById(chatId, req.user.id, {
      cursor,
      limit: safeLimit,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = chat.messages || [];

    res.json({
      ...chat,
      messages,
      nextCursor: messages.length ? messages[messages.length - 1].id : null,
    });
  } catch (err) {
    next(err);
  }
}

async function editChat(req, res, next) {
  try {
    const { chatId } = req.params;
    const { name } = req.body;

    const updatedChat = await chatService.editChat({
      chatId,
      name,
      currentUserId: req.user.id,
    });

    res.json(updatedChat);
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
  createChat,
  getChatById,
  editChat,
  addUser,
  removeMe,
};
