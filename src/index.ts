import { App } from "./app";

const app = new App();

app.get("/profile/:userId/post/:postId", (req) => {
    console.log(`Navigate to ${req.path}`);
    console.log(`User ID is ${req.params.userId}`);
    console.log(`Post ID is ${req.params.postId}`);
});

app.handle("/profile/1/post/10");
