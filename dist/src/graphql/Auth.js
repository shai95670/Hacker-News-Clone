"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMutation = exports.AuthPayload = void 0;
const nexus_1 = require("nexus");
const bcrypt = __importStar(require("bcryptjs"));
const auth_1 = require("../utils/auth");
exports.AuthPayload = (0, nexus_1.objectType)({
    name: 'AuthPayload',
    definition(t) {
        t.nonNull.string('token'),
            t.nonNull.field("user", {
                type: "User",
            });
    },
});
exports.AuthMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("signup", {
            type: 'AuthPayload',
            args: {
                email: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                password: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            async resolve(parent, args, context, info) {
                const { email, password } = args;
                console.log(args);
                const hash = await bcrypt.hash(password, 10);
                const user = await context.prisma.user.create({ data: { email, password: hash } });
                const token = (0, auth_1.generateJwtToken)(user.id);
                ;
                return {
                    token,
                    user
                };
            }
        });
        t.nonNull.field("login", {
            type: 'AuthPayload',
            args: {
                email: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                password: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            async resolve(parent, args, context, info) {
                const { email, password } = args;
                const user = await context.prisma.user.findUnique({ where: { email } });
                if (!user) {
                    throw new Error("No such user found");
                }
                ;
                const isPassword = await bcrypt.compare(password, user.password);
                if (!isPassword) {
                    throw new Error("Invalid password");
                }
                ;
                const token = (0, auth_1.generateJwtToken)(user.id);
                return {
                    user,
                    token
                };
            }
        });
    },
});
//# sourceMappingURL=Auth.js.map