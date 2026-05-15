const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/* ================= HASH PASSWORD ================= */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/* ================= COMPARE PASSWORD ================= */
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {
    hashPassword,
    comparePassword
};