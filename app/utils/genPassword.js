const crypto = require("crypto");

// Generate random password
function generatePassword() {
  // 8-character password
  return crypto.randomBytes(4).toString("hex");
}

module.exports = generatePassword();