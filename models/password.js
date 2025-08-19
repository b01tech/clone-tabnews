import bcrypt from "bcryptjs";

async function hash(inputPassword) {
    const rounds = 10;
    return await bcrypt.hash(inputPassword, rounds);
}

async function compare(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
}

const password = {
    hash,
    compare,
};

export default password;
