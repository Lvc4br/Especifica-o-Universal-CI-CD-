/**
 * Generates a GitHub Actions workflow for a plain HTML/CSS site.
 * This is declarative output only: generation never contacts GitHub or deploys.
 */
export function createStaticSiteWorkflow(branchName = "main"): string {
  const safeBranch = /^[A-Za-z0-9._/-]{1,100}$/.test(branchName) && !branchName.includes("..")
    ? branchName
    : "main";

  return `name: Universal CI/CD — Static site

on:
  push:
    branches: [${safeBranch}]
  pull_request:
    branches: [${safeBranch}]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: static-site-${"${{ github.ref }}"}
  cancel-in-progress: true

jobs:
  validate:
    name: Validate HTML and CSS
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Validate HTML
        run: npm exec --yes --package=html-validate -- html-validate "**/*.html"
      - name: Check HTML and CSS formatting and syntax
        run: npm exec --yes --package=prettier -- prettier --check "**/*.{html,css}"

  deploy:
    name: Deploy to GitHub Pages
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/${safeBranch}'
    needs: validate
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${"${{ steps.deployment.outputs.page_url }}"}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Configure GitHub Pages
        uses: actions/configure-pages@v5
      - name: Upload static site
        uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
`;
}
