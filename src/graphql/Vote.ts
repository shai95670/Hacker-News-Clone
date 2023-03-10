import { objectType, extendType, nonNull, intArg } from "nexus";
import { User } from "@prisma/client";

export const Vote = objectType({
    name: 'Vote',
    definition(t) {
        t.nonNull.int('id'),
        t.nonNull.field("user", {
            type: "User",
          }),
        t.nonNull.field("link", {
          type: "Link",
        })
    },
});

export const VoteMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("voteByLinkId", {
            type: 'Vote',
            args: {
                id: nonNull(intArg())
            },
            async resolve(parent, args, context, info) {
                if(!context.userId) {
                    throw new Error("User not authenticated");
                };
                const { id } = args;
                console.log(id)
                try {
                    const updatedLink = await context.prisma.link.update({
                        where: { id },
                        data:{
                            voters: {
                              connect: {
                                id: context.userId
                              }
                            }                
                        }
                    });
                    const user = await context.prisma.user.findUnique({ where: { id: context.userId } });
                    return {
                        id: Math.floor(Math.random() * 10000),
                        user: user as User,
                        link: updatedLink
                    };
                } catch (error) {
                  throw new Error("Link not found");  
                }
            }
        });
    },
});