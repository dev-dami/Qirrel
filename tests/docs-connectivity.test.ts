import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve(__dirname, "..", "docs");
const pagesDir = path.join(docsRoot, "pages");

const topicPages = [
  "api.html",
  "basic.html",
  "caching.html",
  "configuration.html",
  "events.html",
  "examples.html",
  "llm.html",
  "walkthrough.html",
];

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(docsRoot, relativePath), "utf8");
}

function extractHrefs(html: string): string[] {
  const hrefs: string[] = [];
  const pattern = /href="([^"]+)"/g;

  for (const match of html.matchAll(pattern)) {
    if (match[1]) {
      hrefs.push(match[1]);
    }
  }

  return hrefs;
}

describe("docs connectivity", () => {
  test("docs index links to each topic page", () => {
    const hrefs = extractHrefs(readFile("index.html"));
    for (const page of topicPages) {
      expect(hrefs).toContain(`./pages/${page}`);
    }
  });

  test("every topic page links to docs hub, root README, and all topic pages", () => {
    for (const page of topicPages) {
      const hrefs = extractHrefs(readFile(path.join("pages", page)));

      expect(hrefs).toContain("../index.html");
      expect(hrefs).toContain("../../README.MD");

      for (const linkedPage of topicPages) {
        expect(hrefs).toContain(`./${linkedPage}`);
      }
    }
  });

  test("all local links resolve to an existing file", () => {
    const htmlFiles = [
      "index.html",
      ...fs
        .readdirSync(pagesDir)
        .filter((file) => file.endsWith(".html"))
        .map((file) => path.join("pages", file)),
    ];

    for (const htmlFile of htmlFiles) {
      const html = readFile(htmlFile);
      const hrefs = extractHrefs(html);

      for (const href of hrefs) {
        if (href.startsWith("http://") || href.startsWith("https://")) {
          continue;
        }

        const resolved = path.resolve(path.join(docsRoot, htmlFile, ".."), href);
        expect(fs.existsSync(resolved)).toBe(true);
      }
    }
  });
});
