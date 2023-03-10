import { extendType, nonNull, objectType, stringArg, intArg } from "nexus";

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id'),
    t.nonNull.string('description'),
    t.nonNull.string('url'),
    t.nonNull.dateTime("createdAt"),
    t.field("postedBy", {
      type: "User",
      async resolve(root, args, context){
        return await context.prisma.link.findUnique({where: { id: root.id }}).postedBy();
      }
    }),
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      async resolve(root, args, context){
        return await context.prisma.link.findUnique({where: { id: root.id }}).voters();
      }
    })
  },
});

export const Feed = objectType({
  name: 'Feed',
  definition(t) {
    t.nonNull.int('linksCount'),
    t.nonNull.list.nonNull.field("links", { type: Link }); 
  },
});

export const LinksQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("getLinks", {
      type: 'Feed',
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg()
      },
      async resolve(parent, args, context, info) {
        const where = args.filter ? 
        { OR: 
          [
            { description: { contains: args.filter } },
            { url: { contains: args.filter } }
          ]
        }
        : 
        {};
        
        const linksCount = await context.prisma.link.count();
        const links =  await context.prisma.link.findMany({ 
          where,
          skip: args?.skip as number || undefined,
          take: args?.take as number || undefined,
        });

        return {links, linksCount};
      }
    });
    t.field("getLinkById", {
      type: 'Link',
      args: {
        id: nonNull(intArg())
      },
      async resolve(parent, args, context, info) {
          const { id } = args;
          const link = await context.prisma.link.findUnique({ where: { id } });
          if(!link) {
            throw new Error(`Link with the id of ${id} not found`);
          };
          return link;
      }
    });
  },
});

export const LinksMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createLink", {
      type: 'Link',
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      async resolve(parent, args, context, info) {
        if(!context.userId) {
          throw new Error("User not authenticated");
        };
        const { description, url } = args;
        const { userId } = context;
        const linkData = {
          description,
          url,
          postedBy: {connect: {id: userId}}
        };
        const link = await context.prisma.link.create({ data: linkData });
        return link;
      }
    });
    t.nonNull.field("updateLink", {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      async resolve(parent, args, context, info) {
        const { id, description, url } = args;
        try {
          return await context.prisma.link.update({ where: { id }, data: { description, url } });
        } catch (error) {
          throw new Error("Link not found");
        }
      }
    });
    t.nonNull.field("deleteLink", {
      type: 'Link',
      args: { id: nonNull(intArg()) },
      async resolve(parent, args, context, info) {
        const { id } = args;
        try {
          return await context.prisma.link.delete({ where: { id } });
        } catch (error) {
          throw new Error("Link not found");
        }
      }
    });
  },
});
