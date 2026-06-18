import argon2 from "argon2";
import { env } from "../config/env.js";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: env.argon2MemoryCost,
    timeCost: env.argon2TimeCost,
    parallelism: env.argon2Parallelism,
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
}
