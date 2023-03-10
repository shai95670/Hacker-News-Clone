"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteMutation = exports.Vote = void 0;
const nexus_1 = require("nexus");
exports.Vote = (0, nexus_1.objectType)({
    name: 'Vote',
    definition(t) {
        t.nonNull.int('id'),
            t.nonNull.field("user", {
                type: "User",
            }),
            t.nonNull.field("link", {
                type: "Link",
            });
    },
});
exports.VoteMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("voteByLinkId", {
            type: 'Vote',
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)())
            },
            async resolve(parent, args, context, info) {
                if (!context.userId) {
                    throw new Error("User not authenticated");
                }
                ;
                const { id } = args;
                const updatedLink = await context.prisma.link.update({
                    where: { id },
                    data: {
                        voters: {
                            connect: {
                                id: context.userId
                            }
                        }
                    }
                });
                const user = await context.prisma.user.findUnique({ where: { id: context.userId } });
                return {
                    id: Date.now(),
                    user: user,
                    link: updatedLink
                };
            }
        });
    },
});
//# sourceMappingURL=Vote.js.map