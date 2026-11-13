window.LESSONS = window.LESSONS || [];
window.NY = (...l) => l.join('\n') + '\n';
/* NRUN(r): common check prefix — the workflow must execute */
window.NRUN = r => r.ok ? null : 'the workflow must execute without errors: ' + r.error;

/* ============ 01 WHAT IS n8n ============ */
LESSONS.push({
  id: 'what-is-n8n', num: 1, cat: 'core', layer: 1, mins: 12,
  title: 'What is n8n?', short: 'Triggers, nodes, connections, executions',
  overview: `<p><b>n8n</b> is a workflow automation platform: you connect <b>nodes</b> on a canvas, and data flows from a <b>trigger</b> through each node to the end. It has 400+ integrations, a Code node for anything custom, and native AI Agent nodes. It's "fair-code" licensed: you can <b>self-host</b> it (Docker, AWS) or use n8n Cloud.</p>`,
  hook: `<b>Trigger → nodes → output. Every run is an execution you can inspect.</b>`,
  why: `n8n is one of your four focus tools and the engine of your AI automation offers. Knowing its model deeply (not just clicking nodes) is what separates a $50 gig from a $1,500 project.`,
  scene: { type: 'graph', nodes: [
    { id: 'trig', x: 120, y: 240, icon: 'bell', label: 'Trigger', sub: 'webhook · schedule · app' },
    { id: 'n1', x: 330, y: 240, icon: 'gear', label: 'Node', sub: 'Edit Fields' },
    { id: 'n2', x: 540, y: 120, icon: 'api', label: 'Node', sub: 'HTTP Request', at: 1 },
    { id: 'n3', x: 540, y: 360, icon: 'code', label: 'Node', sub: 'Code', at: 1 },
    { id: 'out', x: 780, y: 240, icon: 'bell', label: 'Action', sub: 'Slack · CRM · email', at: 2 },
    { id: 'exec', x: 780, y: 420, icon: 'log', label: 'Executions', sub: 'every run saved', at: 3 }
  ], edges: [{ a: 'trig', b: 'n1' }, { a: 'n1', b: 'n2', at: 1 }, { a: 'n1', b: 'n3', at: 1 }, { a: 'n2', b: 'out', at: 2 }, { a: 'n3', b: 'out', at: 2 }, { a: 'out', b: 'exec', at: 3 }] },
  steps: [
    { t: 'Workflows and nodes', sub: 'The canvas',
      body: `<p>A <b>workflow</b> is a set of <b>nodes</b> joined by <b>connections</b>. Each node does one job: receive a webhook, change fields, call an API, decide, send a message. Data leaves one node's output and enters the next node's input.</p>`,
      analogy: `A <b>jeepney route</b>: the trigger is the terminal, each node is a stop where passengers (data) get on, off or change seats.`,
      hook: `<b>One node, one job. Connections carry the data.</b>`,
      words: ['workflow', 'node', 'connection', 'canvas', 'integration'],
      flow: { from: 'trig', to: 'n1', label: 'ITEMS', detail: ['[{ json: { email, name } }]'], color: 'blue' }, focus: ['trig', 'n1'],
      cmds: [{ c: 'Webhook ▸ POST /lead', o: '[{ "body": { "name": "Ana", "email": "ana@bakeshop.ph" } }]', k: 'wf' }] },
    { t: 'Trigger nodes', sub: 'What starts a workflow',
      body: `<p>Every workflow starts with a <b>trigger</b>: <b>Manual</b> (you click Execute), <b>Webhook</b> (an HTTP request arrives), <b>Schedule</b> (every day at 8 AM), an <b>app trigger</b> (new HubSpot contact, new Gmail), a <b>Form</b> or <b>Chat</b> trigger, or <b>Execute Workflow Trigger</b> when another workflow calls it.</p>`,
      analogy: `The <b>doorbell, alarm clock or phone call</b> that gets you moving.`,
      hook: `<b>No trigger, no run.</b> Manual for testing, webhook/schedule/app for production.`,
      words: ['trigger', 'Webhook', 'Schedule Trigger', 'app trigger', 'Manual Trigger'],
      flow: { from: 'n1', to: 'n2', label: 'NEXT', detail: ['enrich via API'], color: 'purple' }, focus: ['trig', 'n2', 'n3'],
      cmds: [{ c: 'Schedule Trigger ▸ every weekday 08:00 Asia/Manila', o: '[{ "timestamp": "2026-11-16T08:00:00+08:00" }]', k: 'wf' }] },
    { t: 'Executions', sub: 'Every run is recorded',
      body: `<p>Each run is an <b>execution</b>. In the editor you see each node's input and output (green tick, item count). The <b>Executions</b> list keeps past runs (success or error) so you can debug: open one, see exactly what data each node had, and even copy it into the editor to re-test with <b>pinned data</b>.</p>`,
      analogy: `A <b>dashcam</b>: after something goes wrong, you replay exactly what happened.`,
      hook: `<b>Execution = one run. Open it to see every node's input and output.</b>`,
      words: ['execution', 'execution log', 'pinned data', 'debug', 'input/output panel'],
      flow: { from: 'out', to: 'exec', label: 'SAVED', detail: ['#812 success 1.2 s', '#813 error at "CRM"'], color: 'teal' }, focus: ['exec'],
      cmds: [{ c: 'Executions ▸ filter: status = error', o: '#813  Lead intake  error  "CRM": 401 Unauthorized  2026-11-14 09:12', k: 'err' }] },
    { t: 'n8n 2.x: Save vs Publish', sub: 'Drafts don\'t break production',
      body: `<p>Since <b>n8n 2.0</b> (December 2025), <b>Save</b> keeps your edits as a draft and <b>Publish</b> pushes them live. You can edit a running production workflow safely and roll back to earlier versions. n8n 2.x also runs Code nodes in isolated <b>task runners</b> and blocks environment-variable access in Code by default.</p>`,
      analogy: `Writing a <b>new menu in your notebook</b> (save) before printing it for the restaurant (publish).`,
      hook: `<b>Save = draft. Publish = live.</b>`,
      words: ['n8n 2.0', 'Save', 'Publish', 'version history', 'task runners'],
      focus: ['out', 'exec'],
      cmds: [{ c: 'Workflow ▸ Publish', o: 'Published version 7 · previous version 6 kept for rollback', k: 'wf' }] },
    { t: 'Cloud or self-hosted', sub: 'Where n8n runs',
      body: `<p><b>n8n Cloud</b>: hosted by n8n, priced by executions. <b>Self-hosted</b>: run the Docker image on your own server (an EC2 instance, ECS, a VPS) with Postgres; you own the data and the upkeep. For client work: Cloud for speed, self-hosted when data must stay in the client's AWS account (lesson 12).</p>`,
      analogy: `<b>Renting a furnished condo</b> (Cloud) vs <b>owning a house</b> (self-hosted): one is easy, the other gives control and chores.`,
      hook: `<b>Cloud = convenience. Self-hosted = control (and chores).</b>`,
      words: ['n8n Cloud', 'self-hosted', 'Docker', 'Postgres', 'fair-code'],
      cloud: `<b>For your business:</b> clients rarely care which you choose; they care that it runs, is secure and is documented.`,
      focus: ['trig', 'n1', 'n2', 'n3', 'out'],
      cmds: [{ c: 'docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n', o: 'Editor is now accessible via:\nhttp://localhost:5678', k: 'sh' }] }
  ],
  summary: { title: 'You know how n8n works', sub: 'Trigger, nodes, executions', text: `<p>A workflow is nodes joined by connections, starting from a trigger (manual, webhook, schedule, app, form, chat or another workflow). Every run is an execution you can inspect node by node. n8n 2.x separates Save (draft) from Publish (live) and isolates Code in task runners. Run it on n8n Cloud or self-host it with Docker and Postgres.</p>` },
  quiz: [
    { q: 'What starts every n8n workflow?', a: ['A Code node', 'A trigger node', 'A Merge node', 'A credential'], c: 1, why: 'Triggers start executions.' },
    { q: 'In n8n 2.x, editing and clicking Save on a live workflow…', a: ['Immediately changes production', 'Saves a draft; Publish makes it live', 'Deletes the old version', 'Restarts n8n'], c: 1, why: 'Save and Publish are separate since 2.0.' },
    { q: 'Where do you see what data each node had in a past run?', a: ['The Executions list', 'The Credentials page', 'The Templates gallery', 'The Variables page'], c: 0, why: 'Executions store each run\'s node data.' },
    { q: 'A client requires all data to stay in their AWS account. Best option?', a: ['n8n Cloud', 'Self-hosted n8n in their AWS account', 'Zapier', 'A spreadsheet'], c: 1, why: 'Self-hosting keeps data where the client controls it.' }
  ],
  challenge: { task: 'Your first workflow: the Manual trigger has a test item. Add a second field to the Greet node called shout with the city in UPPER CASE ("{{ $json.city.toUpperCase() }}") and execute.',
    hint: NY('nodes:', '  - name: Start', '    type: manual', '    items:', '      - first_name: raul', '        city: Lasam', '  - name: Greet', '    type: set', '    fields:', '      greeting: "Hi {{ $json.first_name }} from {{ $json.city }}!"', '      shout: "{{ $json.city.toUpperCase() }}"', 'connections:', '  - Start -> Greet'),
    starter: NY('nodes:', '  - name: Start', '    type: manual', '    items:', '      - first_name: raul', '        city: Lasam', '  - name: Greet', '    type: set', '    fields:', '      greeting: "Hi {{ $json.first_name }} from {{ $json.city }}!"', 'connections:', '  - Start -> Greet'),
    check: r => NRUN(r) || ((r.out('Greet')[0] || {}).shout === 'LASAM' ? true : 'Greet should output shout: "LASAM"') },
  next: `Before you drag a single node, you need a map. Next: <b>process mapping</b>, the skill that turns a client's messy description into a workflow that actually works.`,
  cheat: [['trigger → nodes → action', 'workflow shape'], ['Manual · Webhook · Schedule · app · Form · Chat', 'triggers'], ['execution', 'one run, inspectable'], ['pinned data', 're-test with saved input'], ['Save vs Publish', 'n8n 2.x draft vs live'], ['Cloud vs self-hosted', 'convenience vs control']]
});

/* ============ 02 PROCESS MAPPING ============ */
LESSONS.push({
  id: 'process-mapping', num: 2, cat: 'core', layer: 1, mins: 15,
  title: 'Process Mapping First', short: 'From a client\'s story to a workflow plan',
  overview: `<p>The most expensive automation mistake is automating the wrong process. <b>Process mapping</b> turns a client's description ("leads come in, someone checks them, then we follow up") into a clear map: <b>trigger</b>, <b>inputs</b>, <b>steps</b>, <b>decisions</b>, <b>outputs</b>, <b>exceptions</b> and <b>owners</b>. The map becomes your workflow, your quote and your documentation.</p>`,
  hook: `<b>Map → agree → build. Never build from a vague sentence.</b>`,
  why: `Process mapping is what lets you sell enterprise-tier projects: clients pay for understanding their process, not for dragging nodes. It's also how you estimate time and price.`,
  scene: { type: 'graph', nodes: [
    { id: 'tr', x: 100, y: 240, icon: 'bell', label: 'Trigger', sub: 'form submitted' },
    { id: 'in', x: 280, y: 110, icon: 'file', label: 'Inputs', sub: 'name, email, budget' },
    { id: 'st', x: 420, y: 240, icon: 'gear', label: 'Steps', sub: 'validate, enrich' },
    { id: 'dec', x: 620, y: 240, icon: 'process', label: 'Decision', sub: 'budget ≥ ₱50k?', at: 1 },
    { id: 'o1', x: 840, y: 110, icon: 'users', label: 'Sales call', sub: 'hot lead', at: 1 },
    { id: 'o2', x: 840, y: 370, icon: 'bell', label: 'Nurture email', sub: 'cold lead', at: 1 },
    { id: 'ex', x: 420, y: 420, icon: 'bug', label: 'Exceptions', sub: 'bad email, duplicate', at: 2 }
  ], edges: [{ a: 'tr', b: 'in' }, { a: 'in', b: 'st' }, { a: 'st', b: 'dec', at: 1 }, { a: 'dec', b: 'o1', at: 1 }, { a: 'dec', b: 'o2', at: 1 }, { a: 'st', b: 'ex', at: 2 }] },
  steps: [
    { t: 'Interview the process', sub: 'As-is, step by step',
      body: `<p>Ask the person who does the work today to walk you through <b>one real example</b>: "What starts it? What do you look at? What do you type, where? What do you decide, and based on what? Who gets told? What goes wrong?" Write the <b>as-is</b> steps, the systems touched and how long each takes.</p>`,
      analogy: `Like a <b>doctor's consultation</b>: listen to the symptoms before prescribing.`,
      hook: `<b>One real example, every click, every decision, every system.</b>`,
      words: ['as-is process', 'stakeholder interview', 'systems', 'time per step', 'pain points'],
      focus: ['tr', 'in', 'st'],
      cmds: [{ c: 'Discovery call ▸ "Walk me through the last lead you handled."', o: '1. Form email arrives  2. copy to Google Sheet  3. check budget  4. if big, call  5. else send template email (≈12 min per lead, 40 leads/week)', k: 'wf' }] },
    { t: 'Find the parts', sub: 'Trigger · inputs · steps · decisions · outputs',
      body: `<p>Turn the story into parts. <b>Trigger</b>: form submitted. <b>Inputs</b>: name, email, company, budget. <b>Steps</b>: validate, enrich, store. <b>Decisions</b>: budget ≥ ₱50,000 → hot. <b>Outputs</b>: CRM contact, Slack alert, email. Each part maps to n8n: trigger → trigger node, steps → nodes, decisions → If/Switch, outputs → action nodes.</p>`,
      analogy: `Breaking a recipe into <b>ingredients, steps and "if the sauce is too thick, add water"</b>.`,
      hook: `<b>Trigger → trigger node. Step → node. Decision → If/Switch. Output → action node.</b>`,
      words: ['trigger', 'inputs', 'decision point', 'outputs', 'business rule'],
      flow: { from: 'dec', to: 'o1', label: 'HOT', detail: ['budget ≥ 50,000 → sales call'], color: 'green' }, focus: ['dec', 'o1', 'o2'],
      cmds: [{ c: 'Map ▸ decision "Hot lead?"', o: 'rule: budget >= 50000 → Slack #sales + CRM stage "Hot"\nelse → nurture email + CRM stage "Nurture"', k: 'wf' }] },
    { t: 'Plan for exceptions', sub: 'The 20% that breaks automations',
      body: `<p>Ask "what goes wrong?": invalid emails, duplicates, the CRM is down, a field is missing, someone writes in Tagalog. Each exception needs a path: <b>skip</b>, <b>retry</b>, <b>route to a human</b>, or <b>alert</b>. Unhandled exceptions are why automations get switched off.</p>`,
      analogy: `A <b>typhoon plan</b> for the jeepney route: which detour, who calls whom.`,
      hook: `<b>Every exception gets a path: skip, retry, human, or alert.</b>`,
      words: ['exception', 'edge case', 'human-in-the-loop', 'retry', 'alert'],
      flow: { from: 'st', to: 'ex', label: 'EXCEPTION', detail: ['email invalid → review queue', 'duplicate → update, don\'t create'], color: 'red' }, focus: ['ex'],
      cmds: [{ c: 'Map ▸ exceptions', o: 'no email → reject with 422 · duplicate → update existing contact · CRM down → retry 3×, then Slack #ops', k: 'err' }] },
    { t: 'Design the to-be', sub: 'Automate, simplify, or keep human',
      body: `<p>Not every step should be automated. Mark each step: <b>automate</b> (rules are clear), <b>assist</b> (AI drafts, human approves), or <b>keep human</b> (judgment, relationships). Remove steps that exist only because of old tools (copying to a sheet nobody reads). The <b>to-be</b> map is what you build and what the client signs off.</p>`,
      analogy: `Renovating a kitchen: <b>remove the wall</b> nobody needs before buying new appliances.`,
      hook: `<b>Simplify first, then automate. Mark: automate · assist · human.</b>`,
      words: ['to-be process', 'simplify', 'assist', 'sign-off', 'scope'],
      focus: ['tr', 'st', 'dec', 'o1', 'o2'],
      cmds: [{ c: 'To-be ▸ time per lead', o: 'before: 12 min manual · after: 0 min (auto) + 2 min human call for hot leads', k: 'wf' }] },
    { t: 'From map to quote and docs', sub: 'The map is your contract',
      body: `<p>The agreed map gives you the <b>node list</b> (estimate effort), the <b>integrations and credentials</b> you need from the client, <b>test cases</b> (one per path and exception), and the <b>handover document</b>. Tools: a swimlane diagram (Miro, a whiteboard, even paper), or a simple table: step · system · rule · owner · exception.</p>`,
      analogy: `An <b>architect's floor plan</b>: the builder prices it, builds it, and the owner checks against it.`,
      hook: `<b>Map = estimate + credentials list + test cases + documentation.</b>`,
      words: ['swimlane', 'SIPOC', 'estimate', 'test case', 'handover'],
      cloud: `<b>For your business:</b> charging for a paid "process mapping session" before the build is how productized automation services justify enterprise prices.`,
      focus: ['tr', 'in', 'st', 'dec', 'o1', 'o2', 'ex'],
      cmds: [{ c: 'Map ▸ test cases', o: '1 hot lead · 2 cold lead · 3 missing email · 4 duplicate · 5 CRM down', k: 'wf' }] }
  ],
  summary: { title: 'You map before you build', sub: 'As-is → parts → exceptions → to-be', text: `<p>Interview one real example of the as-is process, break it into trigger, inputs, steps, decisions, outputs and owners, give every exception a path (skip, retry, human, alert), simplify and mark steps as automate, assist or human, and use the agreed to-be map as your estimate, credentials list, test plan and documentation.</p>` },
  quiz: [
    { q: 'In a process map, "budget ≥ ₱50,000 → hot lead" is a…', a: ['Trigger', 'Decision point (business rule)', 'Output', 'Credential'], c: 1, why: 'It decides which path an item takes.' },
    { q: 'Which n8n nodes usually implement decision points?', a: ['If and Switch', 'Webhook and Schedule', 'Edit Fields and Sort', 'Aggregate and Limit'], c: 0, why: 'If and Switch route items.' },
    { q: 'Why map exceptions before building?', a: ['They make the diagram prettier', 'Unhandled exceptions are the main reason automations fail and get switched off', 'n8n requires it', 'They reduce execution count'], c: 1, why: 'Real data is messy.' },
    { q: 'A step that needs judgment, where AI drafts and a human approves, is marked…', a: ['Automate', 'Assist', 'Delete', 'Trigger'], c: 1, why: 'Assist = AI plus human approval.' }
  ],
  challenge: { task: 'Turn this map into a workflow: Form → Clean (lower-case email) → Hot? (If budget >= 50000) → true: Sales alert, false: Nurture. The nodes exist but the connections are missing. Add the 4 connections.',
    hint: NY('connections:', '  - Form -> Clean', '  - Clean -> Hot?', '  - Hot?:true -> Sales alert', '  - Hot?:false -> Nurture'),
    starter: NY('nodes:', '  - name: Form', '    type: webhook', '    request:', '      body: { name: Ana, email: ANA@Bakeshop.PH, budget: 80000 }', '  - name: Clean', '    type: set', '    include_other: true', '    fields:', '      email: "{{ $json.body.email.toLowerCase() }}"', '      budget: "{{ $json.body.budget }}"', '  - name: Hot?', '    type: if', '    condition: "{{ $json.budget >= 50000 }}"', '  - name: Sales alert', '    type: set', '    fields:', '      text: "🔥 Hot lead: {{ $json.email }}"', '  - name: Nurture', '    type: set', '    fields:', '      template: nurture-1', 'connections: []'),
    check: r => NRUN(r) || (!r.ran('Hot?') ? 'connect Clean -> Hot?' : !r.ran('Sales alert') ? 'connect Hot?:true -> Sales alert' : (r.out('Sales alert')[0] || {}).text !== '🔥 Hot lead: ana@bakeshop.ph' ? 'Sales alert should say "🔥 Hot lead: ana@bakeshop.ph"' : !r.linked('Hot?', 'false', 'Nurture') ? 'connect Hot?:false -> Nurture too (it shows "no items" for this hot lead, which is fine)' : (N8N.run(r.text.replace('budget: 80000', 'budget: 9000')).ran('Nurture') ? true : 'a lead with budget 9000 should reach Nurture')) },
  next: `Your map says "Clean → Hot?". To build it you need to know exactly what flows along those arrows. Next: <b>items, JSON and expressions</b>.`,
  cheat: [['as-is → to-be', 'map, then improve'], ['trigger · inputs · steps · decisions · outputs · owners', 'parts'], ['decision → If / Switch', 'in n8n'], ['exception → skip · retry · human · alert', 'paths'], ['automate · assist · human', 'mark each step'], ['map = estimate + tests + docs', 'business value']]
});

/* ============ 03 ITEMS & EXPRESSIONS ============ */
LESSONS.push({
  id: 'items-expressions', num: 3, cat: 'core', layer: 2, mins: 15,
  title: 'Items, JSON & Expressions', short: '$json, $(\'Node\'), item by item',
  overview: `<p>Everything in n8n is a list of <b>items</b>, and each item has a <b>json</b> object (plus optional <b>binary</b> data like files). Nodes run <b>once per item</b> by default. <b>Expressions</b> in <code>{{ }}</code> read data from the current item (<code>$json</code>) or from earlier nodes (<code>$('Node').item.json</code>) using plain JavaScript.</p>`,
  hook: `<b>Items in, items out. {{ $json.x }} = this item's x. Each node runs per item.</b>`,
  why: `90% of n8n bugs are data-shape bugs: wrong field path, one item instead of many, referencing a node that didn't run. Master items and expressions and you debug in minutes, not hours.`,
  scene: { type: 'graph', nodes: [
    { id: 'a', x: 120, y: 240, icon: 'list', label: 'Items', sub: '[ {json}, {json}, {json} ]' },
    { id: 'n', x: 400, y: 240, icon: 'gear', label: 'Node', sub: 'runs once per item' },
    { id: 'b', x: 680, y: 240, icon: 'list', label: 'Output items', sub: 'same count (usually)' },
    { id: 'expr', x: 400, y: 80, icon: 'code', label: '{{ $json.email }}', sub: 'expression', at: 2 },
    { id: 'prev', x: 680, y: 410, icon: 'search', label: "$('Webhook').item", sub: 'earlier node', at: 3 },
    { id: 'bin', x: 120, y: 410, icon: 'file', label: 'binary', sub: 'files: PDF, image', at: 4 }
  ], edges: [{ a: 'a', b: 'n' }, { a: 'n', b: 'b' }, { a: 'expr', b: 'n', at: 2 }, { a: 'prev', b: 'n', at: 3 }, { a: 'bin', b: 'a', at: 4 }] },
  steps: [
    { t: 'Items', sub: 'A list of JSON objects',
      body: `<p>Data between nodes is an array of items: <code>[{ json: { name: "Ana" } }, { json: { name: "Ben" } }]</code>. Three items in usually means the next node runs three times. A node showing "3 items" is the first thing to check when debugging.</p>`,
      analogy: `Items are <b>passengers</b>; each node is a stop that serves every passenger, one by one.`,
      hook: `<b>Array of { json } objects. Count the items first.</b>`,
      words: ['item', 'json', 'array', 'item count', 'run once per item'],
      flow: { from: 'a', to: 'n', label: '3 ITEMS', detail: ['{name: Ana}', '{name: Ben}', '{name: Carla}'], color: 'blue' }, focus: ['a', 'n'],
      cmds: [{ c: 'Manual Trigger ▸ output', o: '[{ "json": { "name": "Ana" } }, { "json": { "name": "Ben" } }, { "json": { "name": "Carla" } }]', k: 'wf' }] },
    { t: 'Fixed vs expression', sub: 'Typing a value vs computing it',
      body: `<p>A node field can be <b>fixed</b> ("hello") or an <b>expression</b> (starts with <code>{{ }}</code>). Expressions are JavaScript: <code>{{ $json.email.toLowerCase() }}</code>, <code>{{ $json.total * 1.12 }}</code>, <code>{{ $json.tags.includes('vip') ? 'VIP' : 'Regular' }}</code>. A field that is only one expression keeps the value's type (number stays number).</p>`,
      analogy: `A fixed field is a <b>printed price tag</b>; an expression is a <b>calculator</b> that works out the price for each customer.`,
      hook: `<b>{{ }} = JavaScript, evaluated per item.</b>`,
      words: ['expression', 'fixed value', 'JavaScript', 'ternary', 'type'],
      flow: { from: 'n', to: 'b', label: 'EVALUATE', detail: ['{{ $json.total * 1.12 }} → 2800'], color: 'purple' }, focus: ['n', 'b'],
      cmds: [{ c: '{{ $json.total * 1.12 }}', o: '2800', k: 'expr' }] },
    { t: '$json and field paths', sub: 'Reading the current item',
      body: `<p><code>$json</code> is the current item's JSON. Nested fields use dots: <code>$json.body.customer.email</code>; lists use indexes: <code>$json.lines[0].sku</code>. After a Webhook, your data is under <code>$json.body</code> (headers under <code>$json.headers</code>). Missing paths return <code>undefined</code>; a missing parent throws an error.</p>`,
      analogy: `A <b>postal address</b>: country → city → street → house. Skip a level and the mail gets lost.`,
      hook: `<b>Webhook data lives in $json.body. Check the path in the input panel.</b>`,
      words: ['$json', 'dot notation', 'nested field', 'array index', '$json.body'],
      flow: { from: 'expr', to: 'n', label: 'READ', detail: ['$json.body.email → "ana@bakeshop.ph"'], color: 'green' }, focus: ['expr'],
      cmds: [{ c: '{{ $json.body.customer.email }}', o: 'TypeError: Cannot read properties of undefined (reading \'email\')', k: 'err' }] },
    { t: 'Data from earlier nodes', sub: "$('Node name').item.json",
      body: `<p>To read a node further back, use <code>{{ $('Webhook').item.json.body.email }}</code>. <code>.item</code> follows <b>item linking</b> (the matching item for this one); <code>.first()</code>, <code>.last()</code> and <code>.all()</code> give other views. The node must have run on this path. Renaming a node updates references automatically.</p>`,
      analogy: `Asking the <b>previous stop's conductor</b> what this passenger's ticket said.`,
      hook: `<b>$('Name').item.json.x = the linked item from an earlier node.</b>`,
      words: ["$('Node')", '.item', 'item linking', '.first()', '.all()'],
      flow: { from: 'prev', to: 'n', label: 'LOOK BACK', detail: ["$('Webhook').item.json.body.name → Ana"], color: 'amber' }, focus: ['prev', 'n'],
      cmds: [{ c: "{{ $('Webhook').item.json.body.name }}", o: 'Ana', k: 'expr' }] },
    { t: 'Built-ins and binary', sub: '$now, $input, $execution, files',
      body: `<p>Useful built-ins: <code>$now</code> and <code>$today</code> (dates, with <code>.toISO()</code>, <code>.toFormat('yyyy-MM-dd')</code>, <code>.plus({days: 3})</code>), <code>$input.all()</code>, <code>$execution.id</code>, <code>$workflow.name</code>. Files (PDFs, images) travel as <b>binary</b> data next to json, used by nodes like Extract From File or AI document tools. In n8n 2.x, <code>$env</code> is blocked by default for security.</p>`,
      analogy: `Every passenger carries an <b>ID (json)</b> and maybe a <b>bag (binary)</b>.`,
      hook: `<b>$now · $input.all() · $execution.id · binary for files · $env blocked.</b>`,
      words: ['$now', '$today', '$input.all()', '$execution', 'binary data'],
      flow: { from: 'bin', to: 'a', label: 'FILE', detail: ['binary.data: invoice-812.pdf (88 kB)'], color: 'teal' }, focus: ['bin'],
      cmds: [{ c: "{{ $now.plus({ days: 7 }).toFormat('yyyy-MM-dd') }}", o: '2026-11-21', k: 'expr' }] }
  ],
  summary: { title: 'You read n8n data fluently', sub: 'Items, $json, $(), built-ins', text: `<p>Data is a list of items, each with json (and optional binary). Nodes run once per item; expressions in {{ }} are JavaScript evaluated per item. Read the current item with $json (webhook data under $json.body), earlier nodes with $('Name').item.json, and use $now, $input.all(), $execution and $workflow. $env is blocked by default in n8n 2.x.</p>` },
  quiz: [
    { q: 'After a Webhook node, where is the posted JSON?', a: ['$json.headers', '$json.body', '$env.body', '$workflow.body'], c: 1, why: 'Webhook output puts the request body under body.' },
    { q: 'How do you read the email from the Webhook node inside a later node?', a: ["{{ $('Webhook').item.json.body.email }}", '{{ Webhook.email }}', '{{ $node.email }}', '{{ $env.email }}'], c: 0, why: "$('Node').item.json follows item linking." },
    { q: 'A node receives 3 items. By default it…', a: ['Runs once with the first item', 'Runs once per item (3 times)', 'Fails', 'Merges them'], c: 1, why: 'Most nodes process each item.' },
    { q: 'Where do files like PDFs travel between nodes?', a: ['In $env', 'In binary data next to json', 'In the workflow name', 'They can\'t'], c: 1, why: 'Items can carry binary properties.' }
  ],
  challenge: { task: 'The webhook posts an order. In "Shape", output: customer = the name in UPPER CASE, total_with_vat = body.total × 1.12 (a number), first_sku = the first line\'s sku, and received = the execution id from $execution.id.',
    hint: NY('  - name: Shape', '    type: set', '    fields:', '      customer: "{{ $json.body.customer.name.toUpperCase() }}"', '      total_with_vat: "{{ $json.body.total * 1.12 }}"', '      first_sku: "{{ $json.body.lines[0].sku }}"', '      received: "{{ $execution.id }}"'),
    starter: NY('nodes:', '  - name: Webhook', '    type: webhook', '    request:', '      body:', '        customer: { name: Ana Reyes, email: ana@bakeshop.ph }', '        total: 2500', '        lines:', '          - { sku: ENSAYMADA-12, qty: 2 }', '          - { sku: PANDESAL-50, qty: 1 }', '  - name: Shape', '    type: set', '    fields:', '      customer: "{{ $json.name }}"', 'connections:', '  - Webhook -> Shape'),
    check: r => { const e = NRUN(r); if (e) return e; const o = r.out('Shape')[0] || {}; if (o.customer !== 'ANA REYES') return 'customer should be "ANA REYES"'; if (typeof o.total_with_vat !== 'number' || Math.abs(o.total_with_vat - 2800) > 0.01) return 'total_with_vat should be the number 2800'; if (o.first_sku !== 'ENSAYMADA-12') return 'first_sku should be "ENSAYMADA-12"'; return o.received === 'exec_812' ? true : 'received should come from {{ $execution.id }}'; } },
  next: `Now that you can read data, let's look at where it comes from. Next: <b>triggers in depth</b>: webhooks, responses, schedules and forms.`,
  cheat: [['[{ json: {...} }]', 'items'], ['{{ $json.x }}', 'current item'], ['$json.body', 'webhook payload'], ["$('Node').item.json", 'earlier node'], ['$now.toFormat()', 'dates'], ['binary', 'files next to json']]
});

/* ============ 04 TRIGGERS ============ */
LESSONS.push({
  id: 'triggers', num: 4, cat: 'core', layer: 3, mins: 14,
  title: 'Triggers & Webhooks', short: 'Webhook, Respond to Webhook, Schedule, Form',
  overview: `<p>Triggers decide <b>when</b> a workflow runs and <b>what data</b> it starts with. The <b>Webhook</b> node turns your workflow into an API endpoint; <b>Respond to Webhook</b> controls what the caller gets back; <b>Schedule</b> runs on a timetable; <b>Form</b> and <b>Chat</b> triggers give you a ready-made UI; app triggers react to events in other tools.</p>`,
  hook: `<b>Webhook = your workflow is an API. Respond to Webhook = what the caller gets back.</b>`,
  why: `Webhooks connect n8n to forms, GHL, Stripe, your FastAPI app and other workflows. Getting test vs production URLs, responses and schedules right is daily work.`,
  scene: { type: 'graph', nodes: [
    { id: 'client', x: 110, y: 240, icon: 'laptop', label: 'Caller', sub: 'form · app · GHL' },
    { id: 'wh', x: 340, y: 240, icon: 'api', label: 'Webhook', sub: 'POST /lead' },
    { id: 'work', x: 570, y: 240, icon: 'gear', label: 'Work', sub: 'validate, store' },
    { id: 'resp', x: 800, y: 240, icon: 'json', label: 'Respond to Webhook', sub: '200 { ok }', at: 1 },
    { id: 'sch', x: 340, y: 70, icon: 'clock', label: 'Schedule', sub: 'cron', at: 3 },
    { id: 'form', x: 340, y: 420, icon: 'file', label: 'Form / Chat trigger', sub: 'built-in UI', at: 4 }
  ], edges: [{ a: 'client', b: 'wh' }, { a: 'wh', b: 'work' }, { a: 'work', b: 'resp', at: 1 }, { a: 'resp', b: 'client', at: 1 }, { a: 'sch', b: 'work', at: 3 }, { a: 'form', b: 'work', at: 4 }] },
  steps: [
    { t: 'Webhook node', sub: 'Test URL vs production URL',
      body: `<p>A Webhook node gives two URLs: the <b>test URL</b> (works while you click "Listen for test event" in the editor) and the <b>production URL</b> (works when the workflow is published). Set the <b>HTTP method</b> and <b>path</b> (<code>/lead</code>). The output item has <code>headers</code>, <code>params</code>, <code>query</code> and <code>body</code>.</p>`,
      analogy: `A <b>new phone number</b> for your workflow: the test line rings only while you're at your desk.`,
      hook: `<b>/webhook-test/ while building, /webhook/ in production.</b>`,
      words: ['Webhook node', 'test URL', 'production URL', 'HTTP method', 'path'],
      flow: { from: 'client', to: 'wh', label: 'POST', detail: ['/webhook/lead', '{ name, email, budget }'], color: 'blue' }, focus: ['client', 'wh'],
      cmds: [{ c: 'curl -X POST https://n8n.raul.dev/webhook/lead -H "Content-Type: application/json" -d \'{"name":"Ana","email":"ana@bakeshop.ph"}\'', o: '{"message":"Workflow was started"}', k: 'http' }] },
    { t: 'Respond to Webhook', sub: 'Control the reply',
      body: `<p>By default a webhook answers immediately ("Workflow was started") or with the last node's data. Set <b>Respond: Using 'Respond to Webhook' node</b> to send your own status code and body after processing, like <code>201 { id }</code> or <code>422 { error: "email required" }</code>. Callers like forms and apps rely on that answer.</p>`,
      analogy: `Not just "message received", but a proper <b>receipt</b> with an order number.`,
      hook: `<b>Respond to Webhook = your API's answer: status code + body.</b>`,
      words: ['Respond to Webhook', 'status code', 'response body', '201', '422'],
      flow: { from: 'resp', to: 'client', label: '201', detail: ['{ "lead_id": "c_1", "status": "hot" }'], color: 'green' }, focus: ['resp', 'client'],
      cmds: [{ c: 'Respond to Webhook ▸ 201', o: '{ "lead_id": "c_1", "status": "hot" }', k: 'wf' }] },
    { t: 'Secure and validate', sub: 'Public URLs need protection',
      body: `<p>A production webhook URL is public. Turn on <b>authentication</b> (Header Auth, Basic Auth or JWT), validate the payload early (If node: required fields present?), and respond with errors instead of crashing. Never trust that only your form calls it.</p>`,
      analogy: `A <b>gate with a guard</b> and a checklist, not an open door.`,
      hook: `<b>Header Auth on + validate early + clear error response.</b>`,
      words: ['Header Auth', 'Basic Auth', 'validation', 'public endpoint', 'payload'],
      focus: ['wh', 'work'],
      cloud: `See <b>Security Journey Explorer</b> lesson 12 (API security & webhooks).`,
      cmds: [{ c: 'curl -X POST https://n8n.raul.dev/webhook/lead -d \'{}\'', o: '403 Authorization data is wrong!', k: 'err' }] },
    { t: 'Schedule Trigger', sub: 'Cron for workflows',
      body: `<p>The <b>Schedule Trigger</b> runs on an interval (every 15 minutes) or a cron expression (<code>0 8 * * 1-5</code> = 8 AM on weekdays). Set the <b>timezone</b> in workflow settings (Asia/Manila), or reports arrive at 4 PM instead of 8 AM. Use it for daily digests, syncs and cleanups.</p>`,
      analogy: `An <b>alarm clock</b> for your workflow, set in the right timezone.`,
      hook: `<b>0 8 * * 1-5 = 8:00 weekdays. Check the timezone!</b>`,
      words: ['Schedule Trigger', 'cron', 'interval', 'timezone', 'daily digest'],
      flow: { from: 'sch', to: 'work', label: '08:00', detail: ['daily sales digest'], color: 'purple' }, focus: ['sch'],
      cmds: [{ c: 'Schedule Trigger ▸ cron "0 8 * * 1-5" · timezone Asia/Manila', o: 'next runs: Mon 2026-11-16 08:00, Tue 2026-11-17 08:00', k: 'wf' }] },
    { t: 'Form, Chat and app triggers', sub: 'Ready-made entry points',
      body: `<p><b>n8n Form Trigger</b>: a hosted form with fields, no website needed. <b>Chat Trigger</b>: a chat window for AI agents. <b>App triggers</b> (HubSpot, Gmail, Google Sheets, Stripe): react to events, often by polling or registering a webhook for you. <b>Error Trigger</b>: runs when another workflow fails (lesson 10).</p>`,
      analogy: `<b>Different doors</b> into the same shop: the front door, the drive-thru, the delivery window.`,
      hook: `<b>Form = instant UI. Chat = AI entry. App trigger = react to another tool.</b>`,
      words: ['Form Trigger', 'Chat Trigger', 'app trigger', 'polling', 'Error Trigger'],
      flow: { from: 'form', to: 'work', label: 'SUBMIT', detail: ['Form "Book a demo"'], color: 'teal' }, focus: ['form'],
      cmds: [{ c: 'Form Trigger ▸ submission', o: '{ "Name": "Carla", "Email": "carla@clinic.ph", "Service": "Automation audit" }', k: 'wf' }] }
  ],
  summary: { title: 'You control how workflows start', sub: 'Webhooks, responses, schedules, forms', text: `<p>Webhooks expose a test URL while building and a production URL when published; the payload arrives under body. Respond to Webhook returns your own status and body. Protect public webhooks with authentication and early validation. Schedule Trigger runs on intervals or cron (mind the timezone), and Form, Chat, app and Error triggers cover the other entry points.</p>` },
  quiz: [
    { q: 'Your form works while testing but fails after you close the editor. Most likely cause?', a: ['It is still using the test webhook URL', 'The Code node is slow', 'Merge is missing', 'The schedule is wrong'], c: 0, why: 'The test URL only listens while you are testing.' },
    { q: 'How do you return 422 with an error message to the caller?', a: ['Respond to Webhook node', 'Schedule Trigger', 'Aggregate node', 'A sticky note'], c: 0, why: 'Respond to Webhook sets status and body.' },
    { q: 'Cron "0 8 * * 1-5" means…', a: ['Every 8 minutes', '8:00 AM Monday to Friday', 'The 8th of every month', 'Hourly'], c: 1, why: 'minute 0, hour 8, weekdays 1–5.' },
    { q: 'Which trigger runs when another workflow fails?', a: ['Error Trigger', 'Form Trigger', 'Manual Trigger', 'Chat Trigger'], c: 0, why: 'Set it as the error workflow.' }
  ],
  challenge: { task: 'Make the lead webhook answer properly: if body.email is missing, respond 422 {"error":"email required"}; otherwise respond 201 {"status":"received","email": <the email>}. Use an If node "Has email?" and two Respond to Webhook nodes. (The test request has an email.)',
    hint: NY('  - name: Has email?', '    type: if', '    condition: "{{ !!$json.body.email }}"', '  - name: OK', '    type: respond', '    code: 201', '    body:', '      status: received', '      email: "{{ $json.body.email }}"', '  - name: Reject', '    type: respond', '    code: 422', '    body:', '      error: email required', 'connections:', '  - Lead -> Has email?', '  - Has email?:true -> OK', '  - Has email?:false -> Reject'),
    starter: NY('nodes:', '  - name: Lead', '    type: webhook', '    request:', '      headers: { content-type: application/json }', '      body: { name: Ana, email: ana@bakeshop.ph }', 'connections: []'),
    check: r => { const e = NRUN(r); if (e) return e; if (!r.response) return 'add a Respond to Webhook node (type: respond) on the success path'; if (r.response.status !== 201) return 'with an email present the response should be 201'; if ((r.response.body || {}).email !== 'ana@bakeshop.ph' || (r.response.body || {}).status !== 'received') return 'body should be {"status":"received","email":"ana@bakeshop.ph"}'; const r2 = N8N.run(r.text.replace(/email: ana@bakeshop\.ph/, 'phone: "0917"')); return r2.ok && r2.response && r2.response.status === 422 && (r2.response.body || {}).error === 'email required' ? true : 'without an email the workflow should respond 422 {"error":"email required"} (add the If:false branch)'; } },
  next: `Data has arrived. Now shape it. Next: the most-used nodes in n8n: <b>Edit Fields, Filter, Sort, Limit and Remove Duplicates</b>.`,
  cheat: [['/webhook-test/ vs /webhook/', 'test vs production'], ['$json.body · $json.headers · $json.query', 'webhook data'], ['Respond to Webhook', 'status + body'], ['Header Auth', 'protect webhooks'], ['0 8 * * 1-5', 'weekdays 8 AM'], ['Form · Chat · Error Trigger', 'other entries']]
});

/* full worked solutions (used by the tests; hints show only the part to change) */
(function () {
  const L = id => LESSONS.find(l => l.id === id).challenge;
  let c = L('process-mapping'); c.solution = c.starter.replace('connections: []\n', c.hint);
  c = L('items-expressions'); c.solution = c.starter.replace(/  - name: Shape\n[\s\S]*?connections:\n/, c.hint + 'connections:\n');
  c = L('triggers'); c.solution = c.starter.replace('connections: []\n', c.hint);
})();
