import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 사용자 생성 API
router.post("/users", async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;
    // 이메일 중복 확인
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }
    // 새 사용자 생성
    const newUser = await prisma.users.create({
      data: {
        email,
        password, // 실제 서비스에서는 비밀번호를 해싱해야 합니다.
        nickname,
      },
    });

    // 비밀번호는 응답에서 제외
    const { password: _, ...userData } = newUser;

    return res
      .status(201)
      .json({ message: "회원가입이 완료되었습니다.", data: userData });
  } catch (error) {
    next(error); // 에러 미들웨어로 전달
  }
});

// 모든 사용자 조회 API (간단한 예시)
router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        userId: true,
        email: true,
        nickname: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
});

// 특정 사용자 조회 API (관련된 게시글 포함)
router.get("/users/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.users.findUnique({
      where: { userId: +userId },
      include: {
        Posts: {
          // User에 연결된 모든 Posts를 함께 조회 (관계 필드 사용)
          select: {
            postId: true,
            title: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { password: _, ...userData } = user;
    return res.status(200).json({ data: userData });
  } catch (error) {
    next(error);
  }
});

// 사용자 정보 수정 API (비밀번호 확인 필요)
router.put("/users/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email, password, newPassword, nickname } = req.body;

    const user = await prisma.users.findUnique({
      where: { userId: +userId },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 확인 (실제 환경에서는 해싱된 비밀번호 비교)
    if (user.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await prisma.users.update({
      where: { userId: +userId },
      data: {
        email: email || user.email, // 변경할 값이 없으면 기존 값 유지
        password: newPassword || user.password, // 새 비밀번호가 없으면 기존 비밀번호 유지
        nickname: nickname || user.nickname,
        updatedAt: new Date(), // 수동으로 업데이트 시간 설정
      },
    });

    return res
      .status(200)
      .json({ message: "사용자 정보가 성공적으로 수정되었습니다." });
  } catch (error) {
    next(error);
  }
});

// 사용자 삭제 API (비밀번호 확인 필요)
router.delete("/users/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    const user = await prisma.users.findUnique({
      where: { userId: +userId },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 확인
    if (user.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 사용자와 관련된 모든 게시글도 함께 삭제
    // (Prisma 스키마에 `onDelete: Cascade`를 설정하면 DB 단에서 자동으로 처리 가능)
    // await prisma.post.deleteMany({
    //   where: { userId: +userId },
    // });

    await prisma.users.delete({
      where: { userId: +userId },
    });

    return res
      .status(200)
      .json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
});

export default router;
