import { prisma } from "../config/prisma.js";

async function createSystemMessage({ chatId, systemType, meta = {} }) {
  return await Message.create({
    chatId,
    type: "SYSTEM",
    systemType,
    meta,
    senderId: null,
    content: null,
  });
}

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
  return prisma.$transaction(async (tx) => {
    const result = await tx.message.updateMany({
      where: {
        id: messageId,
        senderId: userId,
        deletedAt: null,
      },
      data: {
        content,
        editedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new Error("Not authorized or message not editable");
    }

    // get chatId for updating chat timestamp
    const message = await tx.message.findUnique({
      where: { id: messageId },
      select: { chatId: true },
    });

    await tx.chat.update({
      where: { id: message.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  });
}

async function deleteMessage({ messageId, userId }) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.message.updateMany({
      where: {
        id: messageId,
        senderId: userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        content: "",
      },
    });

    if (result.count === 0) {
      throw new Error("Not authorized or message not found");
    }

    // get chatId for updating chat timestamp
    const message = await tx.message.findUnique({
      where: { id: messageId },
      select: { chatId: true },
    });

    await tx.chat.update({
      where: { id: message.chatId },
      data: { updatedAt: new Date() },
    });
  });
}

export default {
  createSystemMessage,
  createMessage,
  editMessage,
  deleteMessage,
};
