const express = require("express");
const userRouter = require("./routers/users.router");
const postRouter = require("./routers/posts.router");
const cookieParser = require("cookie-parser");
const errorHandingMiddleware = require("./middleware/error-handing-middleware");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/", [userRouter, postRouter]);

app.use(errorHandingMiddleware);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
