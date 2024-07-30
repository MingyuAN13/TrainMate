import bcrypt from "bcryptjs";

/**
 * Hash the given password
 * @param password The password to be hashed
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashSalt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, hashSalt);
}
