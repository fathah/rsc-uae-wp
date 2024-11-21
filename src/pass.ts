import WAWebJS, { Client, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import fs from "fs";
import path from "path";

async function getRegDetails(regid: any) {
  const URL = `https://uaesahithyotsav.com/register/1/get?regid=${regid}`;

  try {
    const response = await fetch(URL);

    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function sendEntryPass(client: Client, message: WAWebJS.Message) {
  const text = message.body;

  if (text.includes("PASS")) {
    try {
      const sender = message.from;
      const regId = text.replace("PASS", "").trim();
      const data = await getRegDetails(regId);
      console.log(data);

      if (!data || !data.name || !data.emirate) {
        await client.sendMessage(sender, "Registration not found");
      } else {
        const name = data.name;
        const emirate = data.emirate;

        const flaskResponse = await axios.get(
          `https://pass.uaesahithyotsav.com/generate-pass?name=${name}&emirate=${emirate}&id=${text}`,
          { responseType: "arraybuffer" }
        );

        const imageBuffer = Buffer.from(flaskResponse.data, "binary");
        const imagePath = path.join(__dirname, "pass.png");

        fs.writeFileSync(imagePath, imageBuffer);

        const media = MessageMedia.fromFilePath(imagePath);

        await client.sendMessage(sender, media);
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
