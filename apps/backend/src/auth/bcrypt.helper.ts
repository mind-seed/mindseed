import bcrypt from "bcrypt";

export async function bcryptHash(data: string) {
  return await bcrypt.hash(data, 12);
}

export async function bcryptCompare(data: string, encrypted: string) {
  return await bcrypt.compare(data, encrypted);
}
