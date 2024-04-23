const { OpenAI } = require("openai");

module.exports = (client) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });
};
