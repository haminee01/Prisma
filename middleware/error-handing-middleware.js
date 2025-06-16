module.exports = function (err, req, res, next) {
  switch (err.message) {
    case "InputValidation":
    case "PasswordValidation":
      return res.status(400).send({
        errorMessage: "입력된 요청이 잘못되었습니다.",
      });
    case "ExistEmail":
      return res.status(400).send({
        errorMessage: "가입된 이메일이 있습니다.",
      });
    case "userNotFound":
      return res.status(404).send({
        errorMessage: "해당 유저가 없습니다.",
      });
    case "PasswordError":
      return res.status(401).send({
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
    case "DataBaseError":
      return res.status(500).send({
        errorMessage: "데이터베이스에 오류가 있습니다.",
      });
    case "password!!!":
      return res.status(400).send({
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
    case "Forbidden":
      return res.status(401).send({
        errorMessage: "접근 권한이 없습니다.",
      });
    case "UserNotFound":
    case "Need login":
    case "accessTokenNotMatched":
      return res.status(401).send({
        errorMessage: "로그인을 해주세요.",
      });
    default:
      return res.status(500).send({
        errorMessage: "서버에 오류가 있습니다.",
      });
  }
};
