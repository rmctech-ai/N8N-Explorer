# n8n Cheat Sheet

_Auto-generated from the n8n Explorer lessons. One master memory hook + the key commands per lesson._

## 01 · What is n8n?

> ★ Trigger → nodes → output. Every run is an execution you can inspect.

| Command | What it does |
|---|---|
| `trigger → nodes → action` | workflow shape |
| `Manual · Webhook · Schedule · app · Form · Chat` | triggers |
| `execution` | one run, inspectable |
| `pinned data` | re-test with saved input |
| `Save vs Publish` | n8n 2.x draft vs live |
| `Cloud vs self-hosted` | convenience vs control |

**Memory hooks:**

- **Workflows and nodes**: One node, one job. Connections carry the data.
- **Trigger nodes**: No trigger, no run. Manual for testing, webhook/schedule/app for production.
- **Executions**: Execution = one run. Open it to see every node's input and output.
- **n8n 2.x: Save vs Publish**: Save = draft. Publish = live.
- **Cloud or self-hosted**: Cloud = convenience. Self-hosted = control (and chores).

## 02 · Process Mapping First

> ★ Map → agree → build. Never build from a vague sentence.

| Command | What it does |
|---|---|
| `as-is → to-be` | map, then improve |
| `trigger · inputs · steps · decisions · outputs · owners` | parts |
| `decision → If / Switch` | in n8n |
| `exception → skip · retry · human · alert` | paths |
| `automate · assist · human` | mark each step |
| `map = estimate + tests + docs` | business value |

**Memory hooks:**

- **Interview the process**: One real example, every click, every decision, every system.
- **Find the parts**: Trigger → trigger node. Step → node. Decision → If/Switch. Output → action node.
- **Plan for exceptions**: Every exception gets a path: skip, retry, human, or alert.
- **Design the to-be**: Simplify first, then automate. Mark: automate · assist · human.
- **From map to quote and docs**: Map = estimate + credentials list + test cases + documentation.

## 03 · Items, JSON & Expressions

> ★ Items in, items out. {{ $json.x }} = this item's x. Each node runs per item.

| Command | What it does |
|---|---|
| `[{ json: {...} }]` | items |
| `{{ $json.x }}` | current item |
| `$json.body` | webhook payload |
| `$('Node').item.json` | earlier node |
| `$now.toFormat()` | dates |
| `binary` | files next to json |

**Memory hooks:**

- **Items**: Array of { json } objects. Count the items first.
- **Fixed vs expression**: {{ }} = JavaScript, evaluated per item.
- **$json and field paths**: Webhook data lives in $json.body. Check the path in the input panel.
- **Data from earlier nodes**: $('Name').item.json.x = the linked item from an earlier node.
- **Built-ins and binary**: $now · $input.all() · $execution.id · binary for files · $env blocked.

## 04 · Triggers & Webhooks

> ★ Webhook = your workflow is an API. Respond to Webhook = what the caller gets back.

| Command | What it does |
|---|---|
| `/webhook-test/ vs /webhook/` | test vs production |
| `$json.body · $json.headers · $json.query` | webhook data |
| `Respond to Webhook` | status + body |
| `Header Auth` | protect webhooks |
| `0 8 * * 1-5` | weekdays 8 AM |
| `Form · Chat · Error Trigger` | other entries |

**Memory hooks:**

- **Webhook node**: /webhook-test/ while building, /webhook/ in production.
- **Respond to Webhook**: Respond to Webhook = your API's answer: status code + body.
- **Secure and validate**: Header Auth on + validate early + clear error response.
- **Schedule Trigger**: 0 8 * * 1-5 = 8:00 weekdays. Check the timezone!
- **Form, Chat and app triggers**: Form = instant UI. Chat = AI entry. App trigger = react to another tool.

## 05 · Shape Data: Edit Fields, Filter, Sort

> ★ Edit Fields shapes. Filter drops. Remove Duplicates dedupes. Sort + Limit = top N.

| Command | What it does |
|---|---|
| `Filter` | keep matches, one output |
| `Remove Duplicates` | one per key |
| `Sort + Limit` | top N |
| `Edit Fields (Set)` | only fields you set |
| `Include Other Input Fields` | keep the rest |
| `name nodes by purpose` | $('Keep paid orders') |

**Memory hooks:**

- **Filter**: Filter = keep matching items, drop the rest. One output.
- **Remove Duplicates**: Dedupe before you create or send.
- **Sort and Limit**: Sort desc + Limit N = top N.
- **Edit Fields (Set)**: Edit Fields outputs only what you set (unless "include other fields").
- **Data shaping tips**: Name nodes by purpose. Shape early. Leave notes.

## 06 · Logic: If, Switch & Merge

> ★ If = 2 ways. Switch = many ways. Merge = back together (append or match by key).

| Command | What it does |
|---|---|
| `If` | true / false |
| `Switch` | named routes + fallback |
| `Merge: Append` | concatenate branches |
| `Merge: Combine by fields` | join two sources |
| `empty branch` | next nodes don't run |
| `segment field → Switch` | clean complex rules |

**Memory hooks:**

- **If**: If → true / false. Empty branch = next nodes don't run.
- **Switch**: Switch = named routes + a fallback. Replace If-chains.
- **Merge: append**: Append = input 1 items, then input 2 items.
- **Merge: combine by matching fields**: Combine by matching fields = SQL JOIN for workflows.
- **Logic hygiene**: Compute a segment field, then Switch on it. Test every branch.

## 07 · Lists: Split Out, Aggregate, Summarize, Loop

> ★ Split Out: 1 → many. Aggregate: many → 1 list. Summarize: many → totals per group.

| Command | What it does |
|---|---|
| `Split Out` | list field → items |
| `Aggregate` | items → one list |
| `Summarize` | group by + sum/count |
| `Loop Over Items` | batches, rate limits |
| `Wait` | pause between batches |
| `Include Other Input Fields` | keep parent fields |

**Memory hooks:**

- **Split Out**: Split Out = unpack a list into items.
- **Work per item**: Split, then let each node run per item.
- **Summarize**: Summarize = group by + sum/count/avg.
- **Aggregate**: Aggregate before "send one message about all of them".
- **Loop Over Items**: Loop only for batches/rate limits. Most nodes already handle every item.

## 08 · HTTP Request & APIs

> ★ Any API: method + URL + auth (credential) + body. Response → items.

| Command | What it does |
|---|---|
| `GET · POST · PATCH · DELETE` | methods |
| `/path/{{ $json.id }}` | one call per item |
| `credential` | encrypted, not exported |
| `401 · 404 · 422 · 429 · 5xx` | auth · missing · invalid · slow down · retry |
| `pagination` | follow next_page |
| `Import cURL` | from API docs |

**Memory hooks:**

- **Anatomy of a request**: GET read · POST create · PATCH update · DELETE remove. One call per item.
- **Response to items**: 2xx ok · 4xx fix your request · 429 slow down · 5xx retry later.
- **Credentials**: Credential, never a pasted key. Exports don't include credentials.
- **Pagination and rate limits**: Paginate until no next page. Batch + wait for rate limits.
- **Import cURL and read the docs**: Import cURL → swap key for credential → test 1 item → pin.

## 09 · The Code Node

> ★ Run once for all items → $input.all(). Must return items: [{ json }].

| Command | What it does |
|---|---|
| `$input.all()` | all items |
| `$json` | current item (each mode) |
| `return [{ json }]` | required format |
| `task runner` | isolated in 2.x |
| `$env` | blocked by default |
| `nodes first, Code when clearer` | rule of thumb |

**Memory hooks:**

- **Run once for all items**: $input.all() in, [{ json }] out.
- **Run once for each item**: Each-item mode: $json in, one { json } out.
- **Return format**: Always return an array of { json } objects.
- **n8n 2.x task runners**: Task runner = sandbox. No $env. Native Python via runners.
- **Code or nodes?**: Readable nodes first. Short, named, commented Code when it's clearer.

## 10 · Error Handling & Reliability

> ★ Retry the flaky. Route the failed. Alert on the fatal. Never fail silently.

| Command | What it does |
|---|---|
| `Retry On Fail` | 429 / 5xx / timeouts |
| `On Error: error output` | failed items get their own path |
| `Error Trigger` | one alert workflow for all |
| `Stop and Error` | fail loudly on bad data |
| `idempotency` | upsert, dedupe, keys |
| `never fail silently` | always alert |

**Memory hooks:**

- **Retry On Fail**: Retry 429 and 5xx. Don't retry 4xx validation/auth errors.
- **On Error settings**: Error output = failed items get their own path; good items keep going.
- **Error workflows**: One Error Trigger workflow, set as Error Workflow everywhere.
- **Validate and stop on purpose**: Fail loudly on bad business data: Stop and Error with a clear message.
- **Idempotency**: Upsert, dedupe, idempotency keys: re-runs are harmless.

## 11 · Sub-workflows, Versions & Publishing

> ★ Repeated logic → sub-workflow (Execute Workflow Trigger). Save drafts, Publish releases.

| Command | What it does |
|---|---|
| `Execute Workflow` | call a sub-workflow |
| `Execute Workflow Trigger` | sub-workflow start |
| `last node output` | returned to caller |
| `Save / Publish / rollback` | n8n 2.x lifecycle |
| `export JSON → Git` | no credentials inside |
| `dev ≠ prod` | separate credentials |

**Memory hooks:**

- **Why sub-workflows**: Repeated 3 times? Make it a sub-workflow.
- **Execute Workflow Trigger**: Sub starts with Execute Workflow Trigger; its last node's items are returned.
- **Save vs Publish**: Test the draft → Publish → roll back if needed.
- **Naming, tags, documentation**: Name · tag · sticky notes · README · export to Git.
- **Environments**: Dev and prod never share credentials or webhooks.

## 12 · Security & Self-Hosting on AWS

> ★ Authenticate webhooks · least-privilege credentials · protect the encryption key · HTTPS · backups · update.

| Command | What it does |
|---|---|
| `Header Auth / signatures` | webhook security |
| `least-privilege credentials` | per client & purpose |
| `N8N_ENCRYPTION_KEY` | set, back up, protect |
| `Docker + RDS Postgres + HTTPS` | AWS hosting |
| `queue mode` | main + Redis + workers |
| `2.x defaults` | task runners, no Execute Command |

**Memory hooks:**

- **Secure the workflows**: Authenticated webhooks + least-privilege credentials.
- **Secure the instance**: Set + back up N8N_ENCRYPTION_KEY. Users and projects per client. Keep 2.x defaults.
- **Host it on AWS**: Docker + RDS Postgres + HTTPS + 443-only SG + Secrets Manager.
- **Scale with queue mode**: Queue mode = main + Redis + N workers. Scale workers for throughput.
- **Operate it**: Back up DB + key · update via dev first · monitor health and errors · prune executions.

## 13 · AI Agents in n8n

> ★ Agent = model + system message + tools (+ memory). Structured output = AI you can route on.

| Command | What it does |
|---|---|
| `AI Agent + chat model` | Claude via Anthropic / Bedrock |
| `system message` | role and rules |
| `Structured Output Parser` | JSON you can route on |
| `tools · memory` | act · remember |
| `human-in-the-loop` | approve risky actions |
| `$json.output` | agent answer |

**Memory hooks:**

- **The AI Agent node**: System message = job description. Prompt = the task. Answer = $json.output.
- **Structured output**: Schema in → JSON out → Switch on $json.output.field.
- **Tools and memory**: Tools = what it can do. Memory = what it remembers. Describe tools clearly.
- **Guardrails**: Human-in-the-loop for risky actions. Least-privilege tools. Validate output.
- **Cost and quality**: Trim input · right-size the model · rules before AI · evaluate on real examples.

## 14 · RAG & Document Workflows

> ★ Ingest: load → chunk → embed → store. Answer: retrieve top K → model answers with sources.

| Command | What it does |
|---|---|
| `load → chunk → embed → store` | ingest |
| `retrieve top K → answer` | query |
| `chunk size + overlap + metadata` | chunking |
| `Supabase pgvector · Pinecone · Qdrant` | vector stores |
| `"answer only from context, cite, say I don't know"` | RAG prompt |
| `Extract From File → AI → validate` | documents |

**Memory hooks:**

- **Why RAG**: RAG = open-book AI. Update the book, not the model.
- **Chunking**: Chunk size + overlap + metadata (source) on every chunk.
- **Embeddings and vector stores**: Embeddings = meaning → vectors. Vector store = find the nearest meanings.
- **Retrieve and answer**: Top K context + "answer only from context, cite sources, say I don't know".
- **Document extraction**: File → text → AI structured extraction → validate → system of record (+ human review).

## 15 · Capstone: AI Lead Intake Pipeline

> ★ Validate → AI classify → route → CRM → Slack → respond. Then document, secure, sell.

| Command | What it does |
|---|---|
| `webhook → validate → AI → route → act → respond` | pipeline shape |
| `structured output + include_input` | keep lead fields |
| `credential + retry` | CRM step |
| `Respond 201 / 422` | caller answer |
| `error workflow + handover doc` | production ready |
| `map · build · handover · care plan` | the offer |

**Memory hooks:**

- **The map**: Trigger · inputs · rules · outputs · exceptions, on one page.
- **Validate and classify**: Validate before AI. AI returns a schema, not prose.
- **Act: CRM, Slack, respond**: CRM (retry) → Slack → 201 with id.
- **Harden it**: Error workflow · webhook auth · tests per path · handover doc · then Publish.
- **Sell it**: Map (paid) → build → handover → care plan. Price on value, template for scale.

