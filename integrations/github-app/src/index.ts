import type { Probot } from "probot";

/**
 * Probot entry point.
 *
 * This first milestone deliberately observes repository events only.
 * It does not create check runs, dispatch workflows, comment on PRs,
 * or trigger deployments until the engine-to-GitHub contract and
 * permission model have been reviewed.
 */
export = (app: Probot): void => {
  app.on("pull_request.opened", async (context) => {
    context.log.info(
      {
        repository: context.payload.repository.full_name,
        pullRequest: context.payload.pull_request.number,
        headSha: context.payload.pull_request.head.sha
      },
      "Universal CI/CD received pull_request.opened"
    );
  });

  app.on("pull_request.synchronize", async (context) => {
    context.log.info(
      {
        repository: context.payload.repository.full_name,
        pullRequest: context.payload.pull_request.number,
        headSha: context.payload.pull_request.head.sha
      },
      "Universal CI/CD received pull_request.synchronize"
    );
  });

  app.on("installation.created", async (context) => {
    context.log.info(
      { installationId: context.payload.installation.id },
      "Universal CI/CD installation created"
    );
  });
};
