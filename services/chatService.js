import createSystemMessage from "./messageService.js";
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
              themeColor: true,
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
              themeColor: true,
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
              themeColor: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
      },
    },
  });

  if (!chat) return null;

  // Collect all userIds from system messages
  const userIds = new Set();

  for (const msg of chat.messages) {
    if (msg.type === "SYSTEM" && msg.meta) {
      if (msg.meta.userId) userIds.add(msg.meta.userId);
      if (msg.meta.addedById) userIds.add(msg.meta.addedById);
      if (msg.meta.changedById) userIds.add(msg.meta.changedById);
    }
  }

  // Fetch those users
  // Create lookup map
  let userMap = new Map();

  if (userIds.size > 0) {
    const users = await prisma.user.findMany({
      where: {
        id: { in: Array.from(userIds) },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        themeColor: true,
      },
    });

    userMap = new Map(users.map((u) => [u.id, u]));
  }

  userMap = new Map(users.map((u) => [u.id, u]));

  // Hydrate messages
  const hydratedMessages = chat.messages.map((msg) => {
    if (msg.type !== "SYSTEM" || !msg.meta) return msg;

    return {
      ...msg,
      meta: {
        ...msg.meta,
        user: msg.meta.userId ? userMap.get(msg.meta.userId) || null : null,
        addedBy: msg.meta.addedById
          ? userMap.get(msg.meta.addedById) || null
          : null,
        changedBy: msg.meta.changedById
          ? userMap.get(msg.meta.changedById) || null
          : null,
      },
    };
  });

  // Return hydrated chat
  return {
    ...chat,
    messages: hydratedMessages,
  };
}

async function editChat({ chatId, name, currentUserId }) {
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

  if (!name || name.trim() === "") {
    throw new Error("Chat name cannot be empty");
  }

  const oldChat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { name: true },
  });

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: {
      name,
      updatedAt: new Date(),
    },
  });

  if (oldChat?.name === name) {
    return oldChat;
  }

  await createSystemMessage({
    chatId,
    systemType: "CHAT_RENAMED",
    meta: {
      oldName: oldChat?.name,
      newName: name,
      changedById: currentUserId,
    },
  });

  return getChatById(chatId, currentUserId);
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

  const existing = await prisma.chatMember.findUnique({
    where: {
      userId_chatId: {
        userId: userIdToAdd,
        chatId,
      },
    },
  });

  if (!existing) {
    await prisma.chatMember.create({
      data: {
        chatId,
        userId: userIdToAdd,
      },
    });

    await createSystemMessage({
      chatId,
      systemType: "USER_ADDED",
      meta: {
        userId: userIdToAdd,
        addedById: currentUserId,
      },
    });
  }

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

async function removeUserFromChat({ chatId, currentUserId, userIdToRemove }) {
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

  await createSystemMessage({
    chatId,
    systemType: "USER_LEFT",
    meta: {
      userId: userIdToRemove,
    },
  });

  await prisma.chatMember.delete({
    where: {
      userId_chatId: {
        userId: userIdToRemove,
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

  return getChatById(chatId, currentUserId);
}

export default {
  getUserChats,
  getChatById,
  createChat,
  editChat,
  addUserToChat,
  removeUserFromChat,
};
