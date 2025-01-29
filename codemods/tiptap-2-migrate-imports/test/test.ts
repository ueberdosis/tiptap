/* eslint-disable semi */
import jscodeshift, { type API } from "jscodeshift";
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "vitest";

import transform from "../src/index.js";

const buildApi = (parser: string | undefined): API => ({
  j: parser ? jscodeshift.withParser(parser) : jscodeshift,
  jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
  stats: () => {
    console.error("The stats function was called, which is not supported on purpose");
  },
  report: () => {
    console.error("The report function was called, which is not supported on purpose");
  },
});

describe("tiptap/2/consolidate-extensions", () => {
  it("test #1", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture1.input"), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture1.output"), "utf-8");

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"), // @ts-expect-error
      {},
    );

    assert.deepEqual(actualOutput?.replace(/W/gm, ""), OUTPUT.replace(/W/gm, ""));
  });

  it("test #2", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture2.input"), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture2.output"), "utf-8");

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"), // @ts-expect-error
      {},
    );

    assert.deepEqual(actualOutput?.replace(/W/gm, ""), OUTPUT.replace(/W/gm, ""));
  });

  it("test #3", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture3.input"), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture3.output"), "utf-8");

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"), // @ts-expect-error
      {},
    );

    assert.deepEqual(actualOutput?.replace(/W/gm, ""), OUTPUT.replace(/W/gm, ""));
  });

  it("test #4", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture4.input"), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture4.output"), "utf-8");

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"), // @ts-expect-error
      {},
    );

    assert.deepEqual(actualOutput?.replace(/W/gm, ""), OUTPUT.replace(/W/gm, ""));
  });

  it("test #5", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture5.input"), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture5.output"), "utf-8");

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
      // @ts-expect-error
      {},
    );

    assert.deepEqual(actualOutput?.replace(/W/gm, ""), OUTPUT.replace(/W/gm, ""));
  });

  it("test #6", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture6.input"), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__/fixture6.output"), "utf-8");

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"), // @ts-expect-error
      {},
    );

    assert.deepEqual(actualOutput?.replace(/W/gm, ""), OUTPUT.replace(/W/gm, ""));
  });
});
