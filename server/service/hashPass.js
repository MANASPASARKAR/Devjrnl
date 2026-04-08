const bcrypt = require("bcryptjs");

const hashPass = async (password) => {

    const saltRounds = 9;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPass = await bcrypt.hash(password, salt);

    return hashedPass;
}

module.exports = hashPass;