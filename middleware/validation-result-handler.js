const { body, validationResult } = require("express-validator");

exports.signUpValidator = [
  body("email")
    .isEmail()
    .withMessage("이메일 형식이 아닙니다.")
    .notEmpty()
    .withMessage("이메일이 없습니다."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("비밀번호가 6자 이하")
    .notEmpty()
    .withMessage("비밀번호가 없습니다."),
  body("nickname").notEmpty().withMessage("닉네임이 없습니다."),
];

// 로그인 입력 검사
exports.loginValidator = [
  body("email")
    .isEmail()
    .withMessage("이메일 형식이 아닙니다.")
    .notEmpty()
    .withMessage("이메일이 없습니다."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("비밀번호가 6자 이하")
    .notEmpty()
    .withMessage("비밀번호가 없습니다."),
];

exports.handleValidationResult = (req, res, next) => {
  const result = validationResult(req).errors;
  if (result.length !== 0) {
    //입력오류
    const extracteError = result.map((err) => err.msg);
    return next(new Error("InputValidation"));
  }
  next();
};
