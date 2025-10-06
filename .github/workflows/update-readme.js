import fs from "fs";
import path from "path";

const exts = {
  Lua: [".lua"],
  "C++": [".cpp", ".cc", ".cxx", ".hpp", ".h"],
  "C#": [".cs"]
};

// === Подсчёт строк ===
function scanDir(dir) {
  const counts = { Lua: 0, "C++": 0, "C#": 0 };
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !file.startsWith(".")) {
      const sub = scanDir(full);
      for (const k of Object.keys(counts)) counts[k] += sub[k];
    } else {
      const ext = path.extname(file).toLowerCase();
      for (const lang of Object.keys(exts)) {
        if (exts[lang].includes(ext)) {
          const lines = fs
            .readFileSync(full, "utf-8")
            .split("\n")
            .filter((l) => l.trim() !== "").length;
          counts[lang] += lines;
        }
      }
    }
  }
  return counts;
}

function calcRatings(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return { Lua: 7, "C++": 8, "C#": 9 };
  const ratings = {};
  for (const lang in counts) {
    ratings[lang] = Math.max(1, Math.round((counts[lang] / total) * 10));
  }
  return ratings;
}

function makeBar(r) {
  const filled = Math.round((r / 10) * 20);
  return "[" + "#".repeat(filled) + "-".repeat(20 - filled) + "]";
}

// === Основная логика ===
const counts = scanDir(".");
const ratings = calcRatings(counts);

const snakeSegment = (pathId, dur, segments) =>
  Array.from({ length: segments })
    .map(
      (_, i) =>
        `<circle r="7"><animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${
          i * 0.2
        }s" path="${pathId}" /></circle>`
    )
    .join("\n      ");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="280" viewBox="0 0 720 280">
  <rect width="100%" height="100%" rx="12" fill="#0b1220"/>
  <g font-family="Segoe UI, Roboto, Arial" font-size="14" fill="#cfe8ff" opacity="0.95">
    <text x="24" y="46">Lua — ${ratings["Lua"]}/10</text>
    <text x="24" y="118">C++ — ${ratings["C++"]}/10</text>
    <text x="24" y="190">C# — ${ratings["C#"]}/10</text>
  </g>
  <defs>
    <path id="p1" d="M100,40 C220,10 420,70 620,40" fill="none" stroke="none"/>
    <path id="p2" d="M100,112 C220,82 420,142 620,112" fill="none" stroke="none"/>
    <path id="p3" d="M100,184 C220,154 420,214 620,184" fill="none" stroke="none"/>
  </defs>

  <!-- Lua -->
  <g>
    <circle r="10" fill="#ffb86b"><animateMotion dur="${
      7 - ratings["Lua"] * 0.3
    }s" repeatCount="indefinite" path="M100,40 C220,10 420,70 620,40" /></circle>
    ${snakeSegment("M100,40 C220,10 420,70 620,40", 7 - ratings["Lua"] * 0.3, 8 + ratings["Lua"])}
  </g>

  <!-- C++ -->
  <g>
    <circle r="10" fill="#6b8bff"><animateMotion dur="${
      7 - ratings["C++"] * 0.3
    }s" repeatCount="indefinite" path="M100,112 C220,82 420,142 620,112" /></circle>
    ${snakeSegment("M100,112 C220,82 420,142 620,112", 7 - ratings["C++"] * 0.3, 8 + ratings["C++"])}
  </g>

  <!-- C# -->
  <g>
    <circle r="10" fill="#5bffb0"><animateMotion dur="${
      7 - ratings["C#"] * 0.3
    }s" repeatCount="indefinite" path="M100,184 C220,154 420,214 620,184" /></circle>
    ${snakeSegment("M100,184 C220,154 420,214 620,184", 7 - ratings["C#"] * 0.3, 8 + ratings["C#"])}
  </g>

  <g transform="translate(360,250)" text-anchor="middle" font-family="Segoe UI, Roboto, Arial" font-size="18">
    <text fill="#e6f7ff" font-weight="700" opacity="0.95">
      <tspan>by KingEnot</tspan>
      <animate attributeName="opacity" values="0.2;1;0.2" dur="4s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="4s" repeatCount="indefinite"/>
    </text>
  </g>
</svg>
`;

const ascii = `
Lua   : ${makeBar(ratings["Lua"])} ${ratings["Lua"]}/10
C++   : ${makeBar(ratings["C++"])} ${ratings["C++"]}/10
C#    : ${makeBar(ratings["C#"])} ${ratings["C#"]}/10

           by KingEnot
`;

const readme = `# 🐍 Snake-Rank — Автоматическая оценка языков

README обновляется автоматически при каждом push.  
Рейтинг формируется по количеству строк кода в Lua, C++ и C#.

---

## 🔢 Текущие оценки
- **Lua** — ${ratings["Lua"]}/10
- **C++** — ${ratings["C++"]}/10
- **C#** — ${ratings["C#"]}/10

---

## 🧬 Анимация
${svg}

---

## ASCII fallback
\`\`\`
${ascii}
\`\`\`

---

*Автоматически обновлено GitHub Actions 🧠*
`;

fs.writeFileSync("README.md", readme);
console.log("✅ README.md обновлён!");
