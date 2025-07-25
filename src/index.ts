import { App } from "./app";

const app = new App();

app.get("/profile/:userId/post/:postId", (req, res) => {
    res.end(
        `<h1>User ID: ${req.params.userId}</h1><h1>Post ID: ${req.params.postId}</h1>`
    );
});

app.get("/", (req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
        JSON.stringify({
            hello: "world",
        })
    );
});

app.listen(3000);
