import { App, type Octokit } from "octokit";

const appId = process.env.STATS_GITHUB_APP_ID || "";
const privateKey = process.env.STATS_GITHUB_PRIVATE_KEY || "";
const installationId = Number(process.env.STATS_GITHUB_INSTALLATION_ID);

let githubClient: Octokit | null = null;

if (appId && privateKey && installationId) {
  const app = new App({
    appId: appId,
    privateKey: privateKey,
  });
  githubClient = await app.getInstallationOctokit(installationId);
}

export { githubClient };
