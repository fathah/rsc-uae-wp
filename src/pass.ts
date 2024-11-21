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

      if (!data || !data.name || !data.emirate) {
        await client.sendMessage(sender, "Registration not found");
      } else {
        const name = data.name;
        const emirate = data.emirate;

        const response = await fetch(
          `https://pass.uaesahithyotsav.com/generate-pass?name=${name}&emirate=${emirate}&id=${text}`
        );

        // Check if the response is OK
        if (!response.ok) {
          console.error("Failed to fetch image:", response.statusText);
          await client.sendMessage(sender, "Failed to generate pass");
        }

        // Get the image as an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Convert the ArrayBuffer to a Node.js Buffer
        const imageBuffer = Buffer.from(arrayBuffer);

        // Save the image buffer to a file
        const imagePath = path.join(__dirname, "pass.png");
        fs.writeFileSync(imagePath, imageBuffer);

        const media = MessageMedia.fromFilePath(imagePath);

        await client.sendMessage(sender, media);
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.log(error);
      await client.sendMessage(message.from, "Error generating pass");
    }
  }
}
