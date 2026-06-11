import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const sourceRoot = path.join(process.cwd(), "src");
const gridPx = 4;
const allowedFinePx = new Set([0, 1, 2]);
const scannedExtensions = new Set([".css", ".tsx"]);
const ignoredFiles = new Set(["designGrid.test.ts"]);
const ignoredValueLines = [
  "box-shadow",
  "shadow-[",
  "rootMargin",
  "rgba(",
  "scale(",
  "duration-",
  "opacity-",
  "z-",
];

const tailwindGridPrefixes = [
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "size",
  "h",
  "min-h",
  "max-h",
  "w",
  "min-w",
  "max-w",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "scroll-mt",
  "rounded",
  "text",
  "leading",
  "translate-x",
  "translate-y",
];

type SourceFile = {
  relativePath: string;
  lines: string[];
};

function getSourceFiles(directory: string): SourceFile[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      return getSourceFiles(absolutePath);
    }

    if (!scannedExtensions.has(path.extname(entry)) || ignoredFiles.has(entry)) {
      return [];
    }

    return [
      {
        relativePath: path.relative(process.cwd(), absolutePath),
        lines: readFileSync(absolutePath, "utf8").split("\n"),
      },
    ];
  });
}

function pixelValue(value: number, unit: "px" | "rem") {
  return unit === "rem" ? value * 16 : value;
}

function isGridValue(valuePx: number) {
  const absoluteValue = Math.abs(valuePx);
  return allowedFinePx.has(absoluteValue) || absoluteValue % gridPx === 0;
}

function shouldIgnoreLine(line: string) {
  return ignoredValueLines.some((ignored) => line.includes(ignored));
}

function inspectCssLengthValues(file: SourceFile) {
  const failures: string[] = [];
  const lengthPattern = /(-?\d*\.?\d+)(px|rem)\b/g;

  file.lines.forEach((line, index) => {
    if (shouldIgnoreLine(line)) {
      return;
    }

    for (const match of line.matchAll(lengthPattern)) {
      const value = Number(match[1]);
      const unit = match[2] as "px" | "rem";
      const valuePx = pixelValue(value, unit);

      if (!isGridValue(valuePx)) {
        failures.push(`${file.relativePath}:${index + 1} uses ${match[0]}, which resolves to ${valuePx}px`);
      }
    }
  });

  return failures;
}

function inspectLucideIconSizes(file: SourceFile) {
  const failures: string[] = [];
  const iconSizePattern = /size=\{(\d*\.?\d+)\}/g;

  file.lines.forEach((line, index) => {
    for (const match of line.matchAll(iconSizePattern)) {
      const sizePx = Number(match[1]);
      if (!isGridValue(sizePx)) {
        failures.push(`${file.relativePath}:${index + 1} uses icon size ${sizePx}px`);
      }
    }
  });

  return failures;
}

function inspectTailwindFractionalUtilities(file: SourceFile) {
  const failures: string[] = [];
  const classPattern = /(?:^|\s|["'`])(?:[a-z-]+:|!)*(?<utility>[a-z-]+-\d+\.\d+)(?=\s|["'`])/g;

  file.lines.forEach((line, index) => {
    for (const match of line.matchAll(classPattern)) {
      const utility = match.groups?.utility;
      const prefix = utility?.replace(/-\d+\.\d+$/, "");
      const scaleValue = Number(utility?.match(/-(\d+\.\d+)$/)?.[1]);

      if (!utility || !prefix || Number.isNaN(scaleValue)) {
        continue;
      }

      if (tailwindGridPrefixes.includes(prefix) && !isGridValue(scaleValue * gridPx)) {
        failures.push(`${file.relativePath}:${index + 1} uses ${utility}, which resolves to ${scaleValue * gridPx}px`);
      }
    }
  });

  return failures;
}

function inspectTailwindArbitraryLengths(file: SourceFile) {
  const failures: string[] = [];
  const arbitraryPattern = /(?:^|\s|["'`])(?:[a-z-]+:|!)*(?<utility>[a-z-]+-\[(?<value>[^\]]+)\])(?=\s|["'`])/g;

  file.lines.forEach((line, index) => {
    if (shouldIgnoreLine(line)) {
      return;
    }

    for (const match of line.matchAll(arbitraryPattern)) {
      const utility = match.groups?.utility;
      const rawValue = match.groups?.value;
      const prefix = utility?.replace(/-\[[^\]]+\]$/, "");

      if (!utility || !rawValue || !prefix || !tailwindGridPrefixes.includes(prefix)) {
        continue;
      }

      if (/%|vh|vw|auto|fr|calc\(/.test(rawValue)) {
        continue;
      }

      for (const lengthMatch of rawValue.matchAll(/(-?\d*\.?\d+)(px|rem)\b/g)) {
        const value = Number(lengthMatch[1]);
        const unit = lengthMatch[2] as "px" | "rem";
        const valuePx = pixelValue(value, unit);

        if (!isGridValue(valuePx)) {
          failures.push(`${file.relativePath}:${index + 1} uses ${utility}, with ${lengthMatch[0]} resolving to ${valuePx}px`);
        }
      }
    }
  });

  return failures;
}

describe("4px design grid", () => {
  it("keeps UI lengths and icon sizes on the 4px grid", () => {
    const failures = getSourceFiles(sourceRoot).flatMap((file) => [
      ...inspectCssLengthValues(file),
      ...inspectLucideIconSizes(file),
      ...inspectTailwindFractionalUtilities(file),
      ...inspectTailwindArbitraryLengths(file),
    ]);

    expect(failures).toEqual([]);
  });
});
