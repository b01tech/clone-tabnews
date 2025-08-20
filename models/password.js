import bcrypt from "bcryptjs";

async function hash(inputPassword) {
    const rounds = getNumberOfRounds();
    return await bcrypt.hash(inputPassword, rounds);
}

function getNumberOfRounds() {
    return process.env.NODE_ENV === "production" ? 12 : 1;
}

async function compare(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
}

const password = {
    hash,
    compare,
};

export default password;
