const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticate-middleware");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "sessac";
const prisma = require("../utils/prisma/index.js");
const bcrypt = require("bcrypt");
const {
  signUpValidator,
  handleValidationResult,
  loginValidator,
} = require("../middleware/validation-result-handler.js");

// 1. 이메일, 비밀번호, 닉네임 입력이 정확하게 왔는지 검증
// 2. 비밀번호 6글자 이상 조건
// 3. 이메일이 중복이 있는지 확인
// 4. 데이터베이스에 저장

router.post(
  "/sign-up",
  signUpValidator,
  loginValidator,
  handleValidationResult,

  async (req, res, next) => {
    const { email, password, nickname } = req.body;
    // 3.
    try {
      const user = await prisma.users.findFirst({
        where: { email },
      });
      if (user) {
        return next(new Error("ExistEmail"));
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const bcryptPassword = await bcrypt.hash(password, salt);

      // 4.
      const newUser = await prisma.users.create({
        data: {
          email,
          password: bcryptPassword,
          nickname,
        },
      });
      return res.status(201).json({
        message: "회원가입이 정상적으로 완료되었습니다.",
      });
    } catch (e) {
      return next(new Error("DataBaseError"));
    }
  }
);

// 로그인 api
// 1. 이메일, 비밀번호 입력 여부 확인
// 2. 이메일에 해당하는 사용자 찾기
// 3. 사용자 존재 여부
// 4. 비밀번호 일치 여부 확인
// 5. JWT 토큰 발급
// 6. 생성된 데이터를 전달

router.post(
  "/login",
  loginValidator,
  handleValidationResult,
  async (req, res, next) => {
    const { email, password } = req.body;
    // 2번까지 완료!
    const user = await prisma.users.findFirst({
      where: { email },
    });
    if (!user) {
      // 유저 없는 경우
      return next(new Error("UserNotFound"));
    }
    // 사용자가 있음
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return next(new Error("PasswordError"));
    }
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      SECRET_KEY,
      {
        expiresIn: "12h",
      }
    );
    return res.status(200).send({
      message: "정상적으로 완료",
      token,
    });
  }
);

router.get("/user", authenticateToken, (req, res, next) => {
  console.log(req.user);
  //next(new Error("ExistEmail"));
});

module.exports = router;
