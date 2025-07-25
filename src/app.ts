import * as http from "node:http";

import type {
    ExtractSlugs,
    Request,
    RouteHandler,
    Routes,
} from "./types/routes";

export class App<PathUnion extends string> {
    private routes: Partial<Routes<PathUnion>> = {};
    private server: http.Server;

    constructor() {
        this.server = http.createServer();
    }

    private getRoutePaths() {
        return Object.keys(this.routes);
    }

    private toSegments(path: string) {
        return path.replace(/^\/+|\/+$/g, "").split("/");
    }

    private findRoute(path: string) {
        const registeredPaths = this.getRoutePaths().map((path) =>
            this.toSegments(path)
        );
        const inputPath = this.toSegments(path);

        // Find all registered paths that match the URL structure
        const possiblePaths = registeredPaths
            .map((registeredPath) => {
                if (registeredPath.length !== inputPath.length) {
                    return;
                }

                const everySegmentMatches = registeredPath.every(
                    (segment, i) =>
                        segment.includes(":") || inputPath[i] === segment
                );

                if (!everySegmentMatches) {
                    return;
                }

                return registeredPath;
            })
            .filter((x) => !!x);

        const minDynamicPaths = Math.min(
            ...possiblePaths.map(
                (path) => path.filter((segment) => segment.includes(":")).length
            )
        );

        // Use the first path that includes the least amount of dynamic URL params
        const bestPath = possiblePaths.find(
            (path) =>
                path.filter((segment) => segment.includes(":")).length ===
                minDynamicPaths
        );

        const routePath = `/${bestPath?.join("/")}` as keyof Routes<PathUnion>;

        const handler = this.routes[routePath];

        const paramKeys =
            bestPath
                ?.map((segment, i) =>
                    segment.includes(":")
                        ? { value: segment, index: i }
                        : undefined
                )
                .filter((x) => !!x) ?? [];

        const params: Request<string>["params"] = {};

        paramKeys.forEach((key) => {
            params[key.value.replace(":", "")] = inputPath[key.index];
        });

        if (handler) {
            return { handler: handler, path: routePath, params: params };
        }
    }

    private handle(
        req: http.IncomingMessage,
        res: http.ServerResponse<http.IncomingMessage>
    ) {
        if (!req.url) {
            return;
        }

        console.log(`GET ${req.url}`);

        const route = this.findRoute(req.url);

        if (!route) {
            res.end("<h1>404 Not Found</h1>");

            return;
        }

        route.handler(
            { ...req, params: route.params } as Request<
                ExtractSlugs<keyof Routes<PathUnion>>
            >,
            res
        );
    }

    listen(port: number) {
        this.server.listen(port);
        this.server.on("request", this.handle.bind(this));
        console.log(`Listening on port ${port}...`);
    }

    get<Path extends PathUnion>(path: Path, handler: RouteHandler<Path>) {
        this.routes[path] = handler;
    }
}
