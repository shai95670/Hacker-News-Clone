"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMutation = exports.LinksQuery = exports.Sort = exports.LinkOrderByInput = exports.Feed = exports.Link = void 0;
const nexus_1 = require("nexus");
exports.Link = (0, nexus_1.objectType)({
    name: 'Link',
    definition(t) {
        t.nonNull.int('id'),
            t.nonNull.string('description'),
            t.nonNull.string('url'),
            t.nonNull.dateTime("createdAt");
        t.field("postedBy", {
            type: "User",
            async resolve(root, args, context) {
                return await context.prisma.link.findUnique({ where: { id: root.id } }).postedBy();
            }
        }),
            t.nonNull.list.nonNull.field("voters", {
                type: "User",
                async resolve(root, args, context) {
                    return await context.prisma.link.findUnique({ where: { id: root.id } }).voters();
                }
            });
    },
});
exports.Feed = (0, nexus_1.objectType)({
    name: 'Feed',
    definition(t) {
        t.nonNull.int('id'),
            t.nonNull.int('linksCount'),
            t.nonNull.list.nonNull.field("links", { type: exports.Link });
    },
});
exports.LinkOrderByInput = (0, nexus_1.inputObjectType)({
    name: 'LinkOrderByInput',
    definition(t) {
        t.field("description", { type: exports.Sort }),
            t.field("url", { type: exports.Sort }),
            t.field("createdAt", { type: exports.Sort });
    },
});
exports.Sort = (0, nexus_1.enumType)({
    name: 'Sort',
    members: ["desc", "asc"]
});
exports.LinksQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.field("getLinks", {
            type: 'Feed',
            args: {
                filter: (0, nexus_1.stringArg)(),
                skip: (0, nexus_1.intArg)(),
                take: (0, nexus_1.intArg)(),
                orderBy: (0, nexus_1.arg)({ type: (0, nexus_1.list)((0, nexus_1.nonNull)(exports.LinkOrderByInput)) })
            },
            async resolve(parent, args, context, info) {
                const where = args.filter ?
                    { OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } }
                        ]
                    }
                    :
                        {};
                const links = await context.prisma.link.findMany({
                    where,
                    skip: (args === null || args === void 0 ? void 0 : args.skip) || undefined,
                    take: (args === null || args === void 0 ? void 0 : args.take) || undefined,
                    orderBy: args === null || args === void 0 ? void 0 : args.orderBy
                });
                const linksCount = context.prisma.link.count({ where });
                return {
                    id: linksCount,
                    linksCount,
                    links
                };
            }
        });
        t.nonNull.field("getLinkById", {
            type: 'Link',
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)())
            },
            async resolve(parent, args, context, info) {
                const { id } = args;
                return await context.prisma.link.findUnique({ where: { id } });
            }
        });
    },
});
exports.PostMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createLink", {
            type: 'Link',
            args: {
                description: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                url: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            async resolve(parent, args, context, info) {
                if (!context.userId) {
                    throw new Error("User not authenticated");
                }
                ;
                const { description, url } = args;
                const { userId } = context;
                const link = {
                    description,
                    url,
                    postedBy: { connect: { id: userId } }
                };
                return await context.prisma.link.create({ data: link });
            }
        });
        t.nonNull.field("updateLink", {
            type: 'Link',
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                description: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                url: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(parent, args, context, info) {
                const { id, description, url } = args;
                return context.prisma.link.update({ where: { id }, data: { description, url } });
            }
        });
        t.nonNull.field("deleteLink", {
            type: 'Link',
            args: { id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()) },
            async resolve(parent, args, context, info) {
                const { id } = args;
                return await context.prisma.link.delete({ where: { id } });
            }
        });
    },
});
//# sourceMappingURL=Link.js.map