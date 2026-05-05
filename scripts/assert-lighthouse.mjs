import { readFileSync } from "node:fs";

const reportPath = process.argv[2] ?? ".lighthouse/mobile.json";
const report = JSON.parse(readFileSync(reportPath, "utf8"));

const categoryThresholds = {
  performance: 0.9,
  accessibility: 1,
  seo: 1,
};

const auditThresholds = [
  {
    id: "largest-contentful-paint",
    label: "LCP",
    max: 2500,
  },
  {
    id: "total-blocking-time",
    label: "TBT",
    max: 200,
  },
  {
    id: "cumulative-layout-shift",
    label: "CLS",
    max: 0.02,
  },
  {
    id: "experimental-interaction-to-next-paint",
    label: "INP",
    max: 200,
    optional: true,
  },
  {
    id: "interaction-to-next-paint",
    label: "INP",
    max: 200,
    optional: true,
  },
];

const failures = [];

Object.entries(categoryThresholds).forEach(([categoryId, minScore]) => {
  const category = report.categories?.[categoryId];
  if (!category) {
    failures.push(`Missing Lighthouse category: ${categoryId}`);
    return;
  }

  if (category.score < minScore) {
    failures.push(
      `${category.title ?? categoryId} score ${category.score} is below ${minScore}`,
    );
  }
});

auditThresholds.forEach(({ id, label, max, optional }) => {
  const audit = report.audits?.[id];
  if (!audit) {
    if (!optional) {
      failures.push(`Missing Lighthouse audit: ${id}`);
    }
    return;
  }

  if (typeof audit.numericValue === "number" && audit.numericValue > max) {
    failures.push(`${label} ${audit.numericValue} is above ${max}`);
  }
});

if (failures.length > 0) {
  console.error("Lighthouse assertions failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Lighthouse assertions passed.");
