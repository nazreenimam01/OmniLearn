"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@genkit-ai/core");
const googleai_1 = require("@genkit-ai/googleai");
exports.default = (0, core_1.defineConfig)({
    plugins: [(0, googleai_1.googleAI)()],
    flows: ["./src/flows/**/*.ts"],
});
