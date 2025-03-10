const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "omaigotto",
    aliases: ["momoi", "vit"],
    version: "1.0",
    author: "Mahi--",
    shortDescription: "Generate audio using TTS (with translation to Japanese)!",
    longDescription: "Translate text to Japanese, then generate audio output using TTS.",
    category: "audio",
    guide: "{p}omaigotto <text> or reply to a message with {p}omaigotto",
  },

  onStart: async function ({ api, event, args }) {
    let text = args.join(" ");

    // Check for replied message if no text is provided
    if (!text && event.messageReply) {
      text = event.messageReply.body; // Get text from the replied message
    }

    if (!text) {
      return api.sendMessage("❌ Please provide some text for the TTS conversion.", event.threadID);
    }

    try {
      // Step 1: Translate text to Japanese
      const { text: translatedText } = await translate(text, "ja");

      // Step 2: Use the translated text in the TTS API
      const apiURL = `http://152.70.49.30:6969/api/vit?text=${encodeURIComponent(translatedText)}`;

      const res = await axios.get(apiURL);
      const base64Audio = res.data?.audio;

      if (!base64Audio) {
        return api.sendMessage("❌ No audio data found.", event.threadID);
      }

      const audioBuffer = Buffer.from(base64Audio, "base64");
      const audioFile = path.join(__dirname, "cache", `TTS_${Date.now()}.mp3`);

      // Ensure cache folder exists
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"));
      }

      fs.writeFileSync(audioFile, audioBuffer);

      const stream = fs.createReadStream(audioFile);
      api.sendMessage(
        { body: `🎙 Translation: ${translatedText}\n🎵 Here is your audio:`, attachment: stream },
        event.threadID,
        () => fs.unlinkSync(audioFile) // Delete the file after sending
      );
    } catch (err) {
      console.error("Error in omaigotto command:", err.message);
      api.sendMessage("❌ An error occurred while generating the audio.", event.threadID);
    }
  },
};

async function translate(text, langCode) {
  const res = await axios.get(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`
  );
  return {
    text: res.data[0].map(item => item[0]).join(''),
    lang: res.data[2]
  };
}
