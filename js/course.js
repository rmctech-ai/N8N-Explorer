window.COURSE = {
 "short": "n8n",
 "key": "n8n-explorer-v1",
 "prompt": "▶",
 "termTitle": "n8n",
 "where": "N8N",
 "lab": "n8n",
 "handsOn": "Workflow Simulator challenge",
 "errRe": "^ERROR|^(4\\d\\d|5\\d\\d)\\b|\"error\"|denied|TypeError|Unauthorized",
 "cats": [
  [
   "all",
   "ALL"
  ],
  [
   "core",
   "FOUNDATIONS"
  ],
  [
   "nodes",
   "CORE NODES"
  ],
  [
   "prod",
   "PRODUCTION"
  ],
  [
   "ai",
   "AI AUTOMATION"
  ]
 ],
 "catTitle": {
  "core": "FOUNDATIONS & PROCESS MAPPING",
  "nodes": "CORE NODES",
  "prod": "PRODUCTION WORKFLOWS",
  "ai": "AI AUTOMATION"
 },
 "kinds": {
  "wf": [
   "WORKFLOW",
   "#ea4b71"
  ],
  "expr": [
   "EXPRESSION",
   "#7c3aed"
  ],
  "http": [
   "HTTP",
   "#1d5bd8"
  ],
  "sh": [
   "SHELL",
   "#0d9488"
  ],
  "err": [
   "ERROR",
   "#e11d48"
  ]
 },
 "layers": [
  "PROCESS",
  "DATA",
  "TRIGGERS",
  "NODES",
  "RELIABILITY",
  "DEPLOY",
  "AI"
 ],
 "levels": [
  [
   0,
   "COPY-PASTER"
  ],
  [
   150,
   "NODE CLICKER"
  ],
  [
   400,
   "WORKFLOW BUILDER"
  ],
  [
   800,
   "PROCESS MAPPER"
  ],
  [
   1300,
   "AUTOMATION ENGINEER"
  ],
  [
   2000,
   "AI AUTOMATION SPECIALIST"
  ],
  [
   2900,
   "AUTOMATION ARCHITECT"
  ]
 ]
};
COURSE.errRe = new RegExp(COURSE.errRe, "i");
