import { createHash } from "crypto";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import type { SiteConfig } from "@/types";

const VERCEL_API = "https://api.vercel.com";

// Files and directories to skip when reading template source
const IGNORE = new Set([".next", "node_modules", ".git", ".env", ".env.local"]);

interface VercelFile {
  file: string;  // relative path
  sha: string;   // sha1 of content
  size: number;
  data: Buffer;
}

// Walk a directory and return all files with their contents
async function walkTemplate(
  dir: string,
  base: string = dir
): Promise<VercelFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: VercelFile[] = [];

  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      const nested = await walkTemplate(fullPath, base);
      files.push(...nested);
    } else {
      const data = await readFile(fullPath);
      const sha = createHash("sha1").update(data).digest("hex");
      const size = (await stat(fullPath)).size;
      files.push({ file: relativePath, sha, size, data });
    }
  }

  return files;
}

// Upload a single file to Vercel's file store
async function uploadFile(
  token: string,
  teamId: string | undefined,
  vercelFile: VercelFile
): Promise<void> {
  const url = new URL(`${VERCEL_API}/v2/files`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": vercelFile.sha,
      "Content-Length": String(vercelFile.size),
    },
    body: new Uint8Array(vercelFile.data),
  });

  // 200 = uploaded, 409 = already exists — both are fine
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`File upload failed for ${vercelFile.file}: ${res.status} ${text}`);
  }
}

// Create a Vercel deployment
async function createDeployment(
  token: string,
  teamId: string | undefined,
  projectId: string,
  projectName: string,
  files: VercelFile[]
): Promise<{ id: string; url: string }> {
  const url = new URL(`${VERCEL_API}/v13/deployments`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const body = {
    name: projectName,
    projectId,
    files: files.map((f) => ({ file: f.file, sha: f.sha, size: f.size })),
    target: "preview",
    projectSettings: {
      framework: "nextjs",
    },
  };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Deployment creation failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { id: data.id, url: data.url };
}

// Poll Vercel until deployment is ready or failed (max 5 min)
export async function pollDeployment(
  token: string,
  teamId: string | undefined,
  deployId: string
): Promise<{ url: string; status: "live" | "failed" }> {
  const maxAttempts = 60; // 60 × 5s = 5 min
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const url = new URL(`${VERCEL_API}/v13/deployments/${deployId}`);
    if (teamId) url.searchParams.set("teamId", teamId);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const readyState: string = data.readyState ?? data.status;

    if (readyState === "READY") {
      return { url: `https://${data.url}`, status: "live" };
    }
    if (readyState === "ERROR" || readyState === "CANCELED") {
      return { url: "", status: "failed" };
    }
  }

  return { url: "", status: "failed" };
}

// Get the Vercel project name from env for a given template
function getProjectInfo(templateId: string): { projectId: string; projectName: string } {
  const envKey = `VERCEL_PROJECT_${templateId.toUpperCase()}`;
  const projectId = process.env[envKey] ?? "";
  const projectName = `localsite-${templateId}`;
  return { projectId, projectName };
}

// Main deploy function — call this from the API route
export async function deployTemplate(
  templateId: string,
  siteConfig: SiteConfig
): Promise<{ deployId: string; deployUrl: string }> {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID || undefined;

  if (!token) throw new Error("VERCEL_API_TOKEN is not set");

  const { projectId, projectName } = getProjectInfo(templateId);
  if (!projectId) {
    throw new Error(`Vercel project ID not set. Add VERCEL_PROJECT_${templateId.toUpperCase()} to .env.local`);
  }

  // Path to the template source on disk (bundled inside this app for Vercel hosting)
  const templateDir = path.join(process.cwd(), "templates", templateId);

  // Read all template files
  const files = await walkTemplate(templateDir);

  // Inject the custom site.config.json
  const configContent = Buffer.from(JSON.stringify(siteConfig, null, 2));
  const configSha = createHash("sha1").update(configContent).digest("hex");
  const configIndex = files.findIndex((f) => f.file === "site.config.json");

  const configFile: VercelFile = {
    file: "site.config.json",
    sha: configSha,
    size: configContent.length,
    data: configContent,
  };

  if (configIndex >= 0) {
    files[configIndex] = configFile;
  } else {
    files.push(configFile);
  }

  // Upload all files in parallel (batches of 10 to avoid rate limits)
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map((f) => uploadFile(token, teamId, f)));
  }

  // Create the deployment
  const { id: deployId, url: deployUrl } = await createDeployment(
    token,
    teamId,
    projectId,
    projectName,
    files
  );

  return { deployId, deployUrl };
}
