import type {
    ExtractSlugs,
    Request,
    RouteHandler,
    Routes,
} from "./types/routes";

export class App<PathUnion extends string> {
    private routes: Partial<Routes<PathUnion>> = {};

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

    get<Path extends PathUnion>(path: Path, handler: RouteHandler<Path>) {
        this.routes[path] = handler;
    }

    handle(path: string) {
        const route = this.findRoute(path);

        if (!route) {
            throw new Error(
                `There are no registered routes matching the path ${path}`
            );
        }

        route.handler(
            {
                path: path,
                // We make the assumption that findRoute() is correctly mapping the params
                params: route.params as Request<
                    ExtractSlugs<keyof Routes<PathUnion>>
                >["params"],
            },
            {}
        );
    }
}
