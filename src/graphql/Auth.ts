import { extendType, nonNull, objectType, stringArg, intArg } from 'nexus';
import { NexusGenObjects } from "../../nexus-typegen";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../utils/auth";
import { generateJwtToken } from '../utils/auth';


export const AuthPayload = objectType({
    name: 'AuthPayload',
    definition(t) {
        t.nonNull.string('token'),
        t.nonNull.field("user", {
          type: "User",
        })
    },
});

export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("signup", {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(parent, args, context, info) {
                const { email, password } = args;
                const hash = await bcrypt.hash(password, 10);
                const user = await context.prisma.user.create({ data: { email, password: hash } });
                const token = generateJwtToken(user.id);;
                return {
                  token,
                  user  
                };
            }
        });
        t.nonNull.field("login", {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(parent, args, context, info) {
                const { email, password } = args;
                const user = await context.prisma.user.findUnique({ where: { email } });
                if(!user) {
                    throw new Error("No such user found");
                };
                const isPassword = await bcrypt.compare(password, user.password);
                if(!isPassword) {
                    throw new Error("Invalid password"); 
                };
                const token = generateJwtToken(user.id);
                return {
                  user,
                  token  
                };
            }
        });
    },
});  