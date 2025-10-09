/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2024 - 2025 Waldiez & contributors
 */
/* eslint-disable max-statements */
import { execSync } from "child_process";
import { existsSync, renameSync, unlinkSync, writeFileSync } from "fs";
import { platform } from "os";

const isCI = process.env.CI === "true";
const isLinux = platform() === "linux";
const forceLocal = process.argv.includes("--local");

// Detect if docker or podman is available
function getContainerRuntime(): "docker" | "podman" | null {
    const runtimes = ["docker", "podman"];

    for (const runtime of runtimes) {
        try {
            execSync(`${runtime} --version`, { stdio: "pipe" });
            return runtime as "docker" | "podman";
        } catch {
            continue;
        }
    }

    return null;
}

// Build locally
function buildLocal() {
    console.log("🔨 Building locally with vite...");
    execSync("bun run build:lib:local", { stdio: "inherit" });
    console.log("✅ Build complete!");
}

// Manage .dockerignore
function setupDockerignore(): () => void {
    const dockerignorePath = "./.dockerignore";
    const dockerignoreBackupPath = "./.dockerignore.backup";
    let hadExisting = false;

    // Backup existing .dockerignore if it exists
    if (existsSync(dockerignorePath)) {
        console.log("📋 Backing up existing .dockerignore...");
        renameSync(dockerignorePath, dockerignoreBackupPath);
        hadExisting = true;
    }

    // Create optimized .dockerignore for build
    const dockerignoreContent = `
# skip python related
pyproject.tom
waldiez
tests
*.py
# Node modules (will be installed in container)
node_modules/
# Build output (will be generated)
dist/
build/
out/
site/
# Git hooks (not needed in container)
.husky/
# Cache and temp files
.cache/
.temp/
.tmp/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
# Git
.git/
.gitignore
# IDE
.vscode/
.idea/
*.swp
*.swo
*~
# OS
.DS_Store
Thumbs.db
# Test and coverage
coverage/
.nyc_output/
*.test.ts
*.spec.ts
__tests__/
__mocks__/
# Docs and misc
docs/
*.md
LICENSE
.github/
.dockerignore.backup
.Containerfile.build
`.trim();

    writeFileSync(dockerignorePath, dockerignoreContent);
    console.log("📝 Created temporary .dockerignore");

    // Return cleanup function
    return () => {
        try {
            unlinkSync(dockerignorePath);
            console.log("🗑️  Removed temporary .dockerignore");
        } catch {}

        if (hadExisting) {
            try {
                renameSync(dockerignoreBackupPath, dockerignorePath);
                console.log("📋 Restored original .dockerignore");
            } catch (error) {
                console.error("⚠️  Failed to restore .dockerignore:", error);
            }
        }
    };
}

// Build in container
function buildInContainer(runtime: "docker" | "podman") {
    console.log(`🐳 Building in ${runtime} container (non-Linux host)...`);

    const image = "oven/bun:latest";
    const workdir = "/app";

    const containerfileContent = `
FROM ${image}
WORKDIR ${workdir}
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build:lib:local
`.trim();

    const containerfilePath = "./.Containerfile.build";
    const cleanupDockerignore = setupDockerignore();

    try {
        writeFileSync(containerfilePath, containerfileContent);

        // Build image
        console.log("📦 Building container image...");
        execSync(`${runtime} build -f ${containerfilePath} -t waldiez-react-builder .`, { stdio: "inherit" });

        // Run container and copy dist
        console.log("🚀 Running build in container...");

        // Remove old dist
        execSync("rm -rf dist", { stdio: "inherit" });

        // Create container, run build, copy dist
        const containerId = execSync(`${runtime} create waldiez-react-builder`, { encoding: "utf-8" }).trim();

        execSync(`${runtime} cp ${containerId}:${workdir}/dist ./dist`, {
            stdio: "inherit",
        });

        // Fix ownership (Unix-like systems)
        if (platform() !== "win32") {
            try {
                const uid = process.getuid?.() || 1000;
                const gid = process.getgid?.() || 1000;
                execSync(`chown -R ${uid}:${gid} ./dist`, { stdio: "pipe" });
                console.log("🔧 Fixed file ownership");
            } catch {
                console.warn("⚠️  Could not fix ownership (may need sudo)");
            }
        }

        // Cleanup container
        execSync(`${runtime} rm ${containerId}`, { stdio: "pipe" });

        console.log("✅ Build complete!");
    } finally {
        // Cleanup temporary Dockerfile
        try {
            unlinkSync(containerfilePath);
        } catch {}

        // Restore .dockerignore
        cleanupDockerignore();
    }
}

// Main execution
function main() {
    console.log(`Platform: ${platform()}`);
    console.log(`CI: ${isCI}`);

    // If in CI or on Linux, build locally
    if (isCI || isLinux || forceLocal) {
        buildLocal();
        return;
    }
    const runtime = getContainerRuntime();

    if (!runtime) {
        console.warn("⚠️  No (running) container runtime detected. Falling back to local build");
        buildLocal();
        return;
    }

    // On non-Linux, try to use container
    console.log("⚠️  Non-Linux host detected. Attempting containerized build...");

    try {
        buildInContainer(runtime);
    } catch (error) {
        console.error("❌ Container build failed:", error);
        console.error("\n💡 Try running with --local flag to build locally anyway.");
        process.exit(1);
    }
}

main();
