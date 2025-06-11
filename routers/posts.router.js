import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 전체 게시글 조회
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        postId: true,
        title: true,
        content: true,
        userId: true,
      },
    });
    res.json(
      posts.map((p) => ({
        id: p.postId,
        title: p.title,
        content: p.content,
        userId: p.userId,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// 특정 게시글 조회
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const post = await prisma.post.findUnique({
      where: { postId: id },
      select: {
        postId: true,
        title: true,
        content: true,
        userId: true,
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({
      id: post.postId,
      title: post.title,
      content: post.content,
      userId: post.userId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// 게시글 생성
router.post("/", async (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      },
    });
    res.status(201).json({
      id: newPost.postId,
      title: newPost.title,
      content: newPost.content,
      userId: newPost.userId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// 게시글 수정
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  try {
    const updatedPost = await prisma.post.update({
      where: { postId: id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });
    res.json({
      id: updatedPost.postId,
      title: updatedPost.title,
      content: updatedPost.content,
      userId: updatedPost.userId,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error: record to update not found
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Failed to update post" });
  }
});

// 게시글 삭제
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.post.delete({
      where: { postId: id },
    });
    res.json({ message: "deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
