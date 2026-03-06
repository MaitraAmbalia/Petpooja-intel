module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/final project/Petpooja-intel/app/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/final project/Petpooja-intel/node_modules/mongoose)");
;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/petpooja";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const cached = global.mongooseCache || {
    conn: null,
    promise: null
};
if (!global.mongooseCache) {
    global.mongooseCache = cached;
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, {
            bufferCommands: false
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
const __TURBOPACK__default__export__ = connectDB;
}),
"[project]/Documents/final project/Petpooja-intel/app/models/User.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/final project/Petpooja-intel/node_modules/mongoose)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
const UserSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$mongoose$29$__["Schema"]({
    name: {
        type: String,
        required: [
            true,
            "Name is required"
        ],
        trim: true
    },
    email: {
        type: String,
        required: [
            true,
            "Email is required"
        ],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String
    },
    image: {
        type: String
    },
    provider: {
        type: String,
        enum: [
            "credentials",
            "google"
        ],
        default: "credentials"
    },
    role: {
        type: String,
        enum: [
            "ADMIN",
            "STAFF",
            "RESTAURANT_OWNER"
        ],
        default: "RESTAURANT_OWNER"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Hash password before saving
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password") || !this.password) return next();
    try {
        const salt = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].genSalt(12);
        this.password = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(candidatePassword, this.password);
};
const User = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$mongoose$29$__["default"].models.User || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$mongoose$29$__["default"].model("User", UserSchema);
const __TURBOPACK__default__export__ = User;
}),
"[project]/Documents/final project/Petpooja-intel/app/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/node_modules/next-auth/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/app/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/app/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
;
;
;
const authOptions = {
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID || "GOOGLE_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_SECRET"
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                    email: credentials.email.toLowerCase()
                });
                if (!user) {
                    throw new Error("No account found with this email");
                }
                if (!user.password) {
                    throw new Error("This account uses Google sign-in");
                }
                const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image
                };
            }
        })
    ],
    callbacks: {
        async signIn ({ user, account, profile }) {
            // Auto-create user on Google sign-in
            if (account?.provider === "google") {
                try {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
                    const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                        email: user.email?.toLowerCase()
                    });
                    if (!existingUser) {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
                            name: user.name,
                            email: user.email?.toLowerCase(),
                            image: user.image,
                            provider: "google",
                            role: "RESTAURANT_OWNER"
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("DEBUG: MongoDB connection error during Google SignIn:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt ({ token, user, account }) {
            if (user) {
                token.role = user.role || "RESTAURANT_OWNER";
                token.id = user.id;
            }
            // For Google users, fetch role from DB
            if (account?.provider === "google" && token.email) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
                const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                    email: token.email
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                }
            }
            return token;
        },
        async session ({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-demo"
};
}),
"[project]/Documents/final project/Petpooja-intel/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/final project/Petpooja-intel/app/lib/auth.ts [app-route] (ecmascript)");
;
;
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$final__project$2f$Petpooja$2d$intel$2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ade47410._.js.map