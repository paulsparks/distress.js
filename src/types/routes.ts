import * as http from "node:http";

export type Request<Params extends string> = {
    params: {
        [Param in Params]: string;
    };
} & http.IncomingMessage;

export type ExtractSlugs<Path extends string> =
    Path extends `${string}/:${infer Slug}/${infer Rest}`
        ? Slug | ExtractSlugs<`/${Rest}`>
        : Path extends `${string}/:${infer Slug}`
        ? Slug
        : never;

export type RouteHandler<Path extends string> = (
    req: Request<ExtractSlugs<Path>>,
    res: http.ServerResponse<http.IncomingMessage>
) => void;

export type Routes<PathUnion extends string> = {
    [Path in PathUnion]: RouteHandler<Path>;
};
