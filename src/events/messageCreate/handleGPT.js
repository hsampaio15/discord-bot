const { gptChannels } = require("../../../config.json");
const { OpenAI } = require("openai");

/**
 *
 * @param {*} message
 */
module.exports = async (client, message) => {
  if (message.author.bot) return; // bot wont reply to himself

  // if message not in the right channel AND does not include bot mention, ignore it
  if (
    !gptChannels.includes(message.channelId) &&
    !message.mentions.users.has(client.user.id)
  )
    return;

  // Else, communicate with OpenAI

  const openai = client.openai;
  await message.channel.sendTyping();
  const sendTypingInterval = setInterval(() => {
    message.channel.sendTyping();
  }, 5000);

  // first fetch previous messages
  let conversation = [];

  conversation.push({
    role: "system",
    content: "Chat GPT is a friendly chatbot.",
  });

  let prevMessages = await message.channel.messages.fetch({ limit: 10 });
  prevMessages.reverse();

  prevMessages.forEach((msg) => {
    if (msg.author.bot && msg.author.id !== client.user.id) return;

    // evaluate username to ensure compatability with openai
    const username = msg.author.username
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "");

    // message belongs to bot, treat as assistant
    if (msg.author.id === client.user.id) {
      conversation.push({
        role: "assistant",
        name: username,
        content: msg.content,
      });
      return;
    }

    // message belongs to regular user
    conversation.push({
      role: "user",
      name: username,
      content: msg.content,
    });
  });

  const response = await openai.chat.completions
    .create({
      messages: conversation,
      model: "gpt-4",
    })
    .catch((error) => console.error("OpenAI Error:\n", error));
  clearInterval(sendTypingInterval);

  if (!response) {
    message.reply(
      "I'm having some trouble with the OpenAI API. Try again in a moment."
    );
    return;
  }

  const responseMessage = response.choices[0].message.content;
  const chunkSizeLimit = 2000;

  for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
    const chunk = responseMessage.substring(i, i + chunkSizeLimit);

    await message.reply(chunk);
  }
};
