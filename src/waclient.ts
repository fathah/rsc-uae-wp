import { Client, LocalAuth } from "whatsapp-web.js";
import ZWAPIConfig from "./configs";
import fs from "fs";
import { join } from "path";
import { sendEntryPass } from "./pass";

const waclient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-site-isolation-trials",
      "--disable-setuid-sandbox",
    ],
  },
  webVersionCache: {
    type: "remote",
    remotePath: ZWAPIConfig.REMOTE_URL,
  },
});

waclient.on("qr", (qr) => {
  // qrcode.generate(qr, {small: true});
  fs.writeFileSync(join(__dirname, "../qr.txt"), qr);
});

waclient.on("ready", () => {
  console.log("⚡ Z-WAPI Client is ready!");
  fs.writeFileSync(join(__dirname, "../qr.txt"), "CONNECTED");
  setTimeout(() => {
    fs.writeFileSync(join(__dirname, "../qr.txt"), "");
  }, 15000);
});

waclient.on("message", async (message) => {
  sendEntryPass(waclient, message);
});

export default waclient;
