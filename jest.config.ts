import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: "./",
});

const config: Config = {
    coverageProvider: "v8",
    testEnvironment: "node", // Use node environment for server/db testing
    moduleNameMapper: {
        // Handle module aliases (this matches your tsconfig path mappings)
        "^@/(.*)$": "<rootDir>/src/$1",
    },
};

export default createJestConfig(config);
