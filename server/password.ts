import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const scryptAsync = promisify(scrypt);

const passwordFilePath = path.join(process.cwd(), "password.json");

const DEFAULT_PASSWORD = "djst";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function getStoredPasswordHash(): Promise<string> {
  try {
    if (!fs.existsSync(passwordFilePath)) {
      const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
      fs.writeFileSync(
        passwordFilePath,
        JSON.stringify({ hashedPassword }),
        "utf8"
      );
      return hashedPassword;
    }

    const data = JSON.parse(fs.readFileSync(passwordFilePath, "utf8"));
    return data.hashedPassword;
  } catch (error) {
    return await hashPassword(DEFAULT_PASSWORD);
  }
}

export async function changePassword(newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(newPassword);
    fs.writeFileSync(
      passwordFilePath,
      JSON.stringify({ hashedPassword }),
      "utf8"
    );
    return true;
  } catch (error) {
    return false;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const storedHash = await getStoredPasswordHash();
  return await comparePasswords(password, storedHash);
}