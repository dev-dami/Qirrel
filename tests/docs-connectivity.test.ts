import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve(__dirname, "..", "docs");
const repoRoot = path.resolve(__dirname, "..");

const topicDocs = [
  "api.md",
  "configuration.md",
  "examples.md",
  "events.md",
  "walkthrough.md",
  "agent-native.md",
  "agent-roadmap.md",
  "benchmarks.md",
  "usage/basic.md",
  "usage/caching.md",
  "integrations/llm.md",
];

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function extractMarkdownLinks(markdown: string): string[] {
  const links: string[] = [];
  const pattern = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  for (const match of markdown.matchAll(pattern)) {
    if (match[1]) {
      links.push(match[1]);
    }
  }

  return links;
}

describe("docs connectivity", () => {
  test("root README points to markdown docs", () => {
    const links = extractMarkdownLinks(readFile("README.MD"));

    expect(links).toContain("./docs/README.md");
    for (const doc of topicDocs) {
      expect(links).toContain(`./docs/${doc}`);
    }
  });

  test("docs home links to each markdown topic page", () => {
    const links = extractMarkdownLinks(readFile("docs/README.md"));

    for (const doc of topicDocs) {
      expect(links).toContain(`./${doc}`);
    }
  });

  test("every docs page links back to docs home", () => {
    for (const doc of topicDocs) {
      const links = extractMarkdownLinks(readFile(path.join("docs", doc)));

      expect(
        links.includes("./README.md") || links.includes("../README.md"),
      ).toBe(true);
    }
  });

  test("all local markdown links in docs resolve to an existing file", () => {
    const markdownFiles = [
      "docs/README.md",
      ...topicDocs.map((doc) => path.join("docs", doc)),
    ];

    for (const markdownFile of markdownFiles) {
      const markdown = readFile(markdownFile);
      const links = extractMarkdownLinks(markdown);

      for (const link of links) {
        if (
          link.startsWith("http://") ||
          link.startsWith("https://") ||
          link.startsWith("#")
        ) {
          continue;
        }

        const resolved = path.resolve(path.join(repoRoot, markdownFile, ".."), link);
        expect(fs.existsSync(resolved)).toBe(true);
      }
    }
  });
});
