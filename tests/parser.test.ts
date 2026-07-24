import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countWords, parsePage } from "@/lib/parser";

const context = {
  url: "https://example.com/",
  httpStatus: 200,
  responseTimeMs: 123.6,
  auditedAt: "2026-07-25T00:00:00.000Z",
};

describe("parsePage", () => {
  it("extracts the complete happy-path report", () => {
    const report = parsePage(
      `<!doctype html>
      <html>
        <head>
          <title>  A useful   page title </title>
          <meta name="DESCRIPTION" content=" A clear   summary. ">
        </head>
        <body>
          <h1>Primary heading</h1>
          <h1>Secondary heading</h1>
          <p>Five readable words live here.</p>
          <img src="one.jpg" alt="Product on a table">
          <img src="two.jpg">
          <img src="three.jpg" alt="   ">
          <script>these machine words are ignored</script>
        </body>
      </html>`,
      context,
    );

    assert.equal(report.title, "A useful page title");
    assert.equal(report.metaDescription, "A clear summary.");
    assert.equal(report.h1Count, 2);
    assert.equal(report.imageCount, 3);
    assert.equal(report.imagesMissingAlt, 2);
    assert.equal(report.wordCount, 9);
    assert.equal(report.responseTimeMs, 124);
  });

  it("returns safe empty values when optional metadata is missing", () => {
    const report = parsePage("<html><body></body></html>", context);

    assert.equal(report.title, null);
    assert.equal(report.metaDescription, null);
    assert.equal(report.h1Count, 0);
    assert.equal(report.imageCount, 0);
    assert.equal(report.imagesMissingAlt, 0);
    assert.equal(report.wordCount, 0);
  });

  it("does not count scripts, styles, SVG, or templates as readable copy", () => {
    const report = parsePage(
      `<body>
        <p>Visible words count.</p>
        <style>.hidden { content: "not visible" }</style>
        <script>const extraWords = true</script>
        <svg><text>chart labels</text></svg>
        <template>future content</template>
      </body>`,
      context,
    );

    assert.equal(report.wordCount, 3);
  });
});

describe("countWords", () => {
  it("handles punctuation, hyphenation, and non-ASCII words", () => {
    assert.equal(countWords("Fast, user-friendly cafés don't hide."), 5);
  });
});
