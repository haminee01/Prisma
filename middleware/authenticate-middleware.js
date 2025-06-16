const jwt = require("jsonwebtoken");
const SECRET_KEY = "sessac";

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (token) {
    token = token.replace(/^"(.*)"$/, "$1"); // 큰따옴표 제거
  }

  if (!token) {
    return next(new Error("TokenNotMatched"));
  }

  const verifiedToken = verifyToken(token);
  if (!verifiedToken) {
    return next(new Error("TokenNotMatched"));
  }

  req.user = verifiedToken.userId;
  next();
};

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (e) {
    return false;
  }
}
