import { App } from "./app";
import * as fs from "node:fs";

const app = new App();

app.get("/profile/:userId/post/:postId", (req, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(
        `<h1>User ID: ${req.params.userId}</h1><h1>Post ID: ${req.params.postId}</h1>`
    );
});

app.get("/", (req, res) => {
    fs.readFile("routes/index.html", (err, data) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end(data);
    });
});

app.listen(3000);
