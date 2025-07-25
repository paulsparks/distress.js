import type { TODO } from "./util";

export type Request<Params extends string> = {
    path: string;
    params: {
        [Param in Params]: string;
    };
};

export type ExtractSlugs<Path extends string> =
    Path extends `${string}/:${infer Slug}/${infer Rest}`
        ? Slug | ExtractSlugs<`/${Rest}`>
        : Path extends `${string}/:${infer Slug}`
        ? Slug
        : never;

export type RouteHandler<Path extends string> = (
    req: Request<ExtractSlugs<Path>>,
    res: TODO
) => void;

export type Routes<PathUnion extends string> = {
    [Path in PathUnion]: RouteHandler<Path>;
};
