window.EXPLAIN = {
"what-is-n8n": [
 ["Every execution starts at a trigger node: manual, webhook, schedule, app, form, chat or another workflow.", ["Code nodes process data; they can't start a run.", null, "Merge combines branches.", "Credentials store secrets; they don't start anything."]],
 ["In n8n 2.x, Save keeps a draft and only Publish changes what runs in production.", ["That was the n8n 1.x behavior.", null, "Old versions are kept in version history.", "Saving doesn't restart the instance."]],
 ["The Executions list stores each run with every node's input and output for debugging.", [null, "Credentials only hold secrets.", "Templates are starting points, not run history.", "Variables are shared values, not run data."]],
 ["Self-hosting n8n in the client's AWS account keeps the data under their control.", ["n8n Cloud runs on n8n's infrastructure.", null, "Zapier is a different hosted service.", "A spreadsheet isn't an automation platform."]]
],
"process-mapping": [
 ["A rule that decides which path an item takes is a decision point.", ["The trigger starts the process.", null, "Outputs are results such as a CRM contact.", "Credentials are secrets, not part of the map."]],
 ["If (two ways) and Switch (many ways) implement decision diamonds.", [null, "Those are triggers.", "Those shape data.", "Those combine or cut lists."]],
 ["Real data is messy; unhandled exceptions make automations fail and lose the client's trust.", ["Looks don't matter.", null, "n8n doesn't require a map.", "Exceptions don't change execution count much."]],
 ["Assist means AI does the draft and a human approves.", ["Automate means no human step.", null, "Deleting removes the step.", "A trigger starts the workflow."]]
],
"items-expressions": [
 ["The Webhook node puts the request body under body (with headers, params and query alongside).", ["Headers are separate from the payload.", null, "$env is for environment variables (blocked by default in 2.x).", "$workflow describes the workflow, not the request."]],
 ["$('Webhook').item.json reads the linked item from that earlier node.", [null, "That isn't valid n8n expression syntax.", "$node isn't the way to read another node's data.", "$env doesn't hold node data."]],
 ["Most nodes run once for each incoming item.", ["Only some nodes, or Code in all-items mode, see everything at once.", null, "Several items are normal.", "Merge is a separate node."]],
 ["Files travel as binary properties next to the json of each item.", ["$env isn't for data.", null, "The workflow name is metadata.", "n8n handles files through binary data."]]
],
"triggers": [
 ["The test URL only listens while you're testing in the editor; production needs the published workflow and the production URL.", [null, "A slow Code node doesn't stop webhooks being received.", "Merge doesn't affect how webhooks are received.", "Schedules don't affect webhooks."]],
 ["Respond to Webhook sends your chosen status code and body to the caller.", [null, "Schedule starts runs on a timer.", "Aggregate combines items.", "Sticky notes are documentation."]],
 ["Cron fields are minute, hour, day of month, month and weekday: minute 0, hour 8, Monday to Friday.", ["Every 8 minutes would be */8 in the minute field.", null, "The 8th would be in the day-of-month field.", "Hourly would be 0 * * * *."]],
 ["The Error Trigger starts the workflow you set as another workflow's Error Workflow.", [null, "Form Trigger starts from a form submission.", "Manual Trigger starts when you click Execute.", "Chat Trigger starts from a chat message."]]
],
"shape-data": [
 ["Filter drops non-matching items with one output; If sends them to a false output instead.", ["They behave differently.", null, "Speed isn't the difference.", "Filter works on any type."]],
 ["Edit Fields outputs only what you set unless Include Other Input Fields is on.", ["That's only with Include Other Input Fields on.", null, "It always outputs items.", "Edit Fields works on json, not just binary."]],
 ["Sort first, then Limit keeps the top N.", [null, "Limiting first keeps an arbitrary 3, then sorts them.", "Merge combines branches.", "Aggregate packs items into one."]],
 ["Remove Duplicates by email keeps one item per person.", [null, "Wait only pauses.", "A trigger can't dedupe.", "Notes don't change data."]]
],
"logic": [
 ["Switch has named outputs per rule plus a fallback output.", [null, "Several Filters lose the \"other\" path and are harder to read.", "Merge brings branches together.", "Limit cuts the list."]],
 ["Combine by matching fields joins items where the chosen fields are equal.", ["Append just concatenates.", null, "Choose Branch picks one input.", "Limit isn't a Merge mode."]],
 ["A branch with no items doesn't execute its next nodes (unless Always Output Data is on).", ["Nodes don't run with empty data by default.", null, "An empty branch isn't an error.", "Nothing runs twice."]],
 ["Append outputs all items from input 1, then all from input 2.", [null, "Matching is the Combine mode.", "Append keeps every item.", "Merge doesn't add numbers."]]
],
"lists": [
 ["Split Out turns the lines array into one item per line.", [null, "Aggregate does the opposite.", "Limit cuts items.", "Merge combines branches."]],
 ["Aggregate packs the 12 items into one item, so one message is sent.", [null, "Split Out makes more items.", "Switch routes items.", "Remove Duplicates drops repeats."]],
 ["Summarize groups by a field and sums, counts or averages others.", [null, "Sort only orders items.", "If routes items.", "Wait pauses."]],
 ["Loop Over Items is for batches, such as API limits per call or rate limits with waits.", ["Most nodes already process every item.", null, "It exists and is useful for batching.", "Triggers don't loop."]]
],
"http-apis": [
 ["401 Unauthorized means missing or invalid authentication.", [null, "Too many requests is 429.", "A crashed server gives 5xx.", "Wrong response fields don't produce 401."]],
 ["Credentials are stored encrypted and are not included in exported workflows.", ["URLs are logged and exported.", null, "Sticky notes are visible to anyone.", "Names are visible metadata."]],
 ["429 means you hit a rate limit: batch, wait and retry.", [null, "A missing endpoint is 404.", "Not logged in is 401.", "Success is 2xx."]],
 ["Import cURL fills in method, URL, headers and body from the docs' example.", [null, "Code is slower to set up and harder to maintain.", "A schedule doesn't configure a request.", "Merge doesn't call APIs."]]
],
"code-node": [
 ["$input.all() returns every incoming item in all-items mode.", [null, "$json is the current item in each-item mode.", "$env is blocked by default and doesn't hold items.", "That only reads the first item."]],
 ["Code must return an array of { json: {...} } items.", ["A string isn't valid output.", null, "Returning nothing raises an error.", "A number isn't valid output."]],
 ["n8n 2.x blocks environment variable access in Code by default.", ["That was older behavior.", null, "Secrets are protected, not exposed.", "It raises an error; it doesn't restart anything."]],
 ["Use Code when logic is complex enough that nodes would be less clear.", ["Nodes are more readable for simple steps.", null, "Code is a valid, common choice.", "Code isn't a trigger."]]
],
"errors": [
 ["503 is temporary, so retrying with a wait usually succeeds.", [null, "Deleting the node removes the function.", "Stopping fails the whole execution.", "Removing the credential causes 401s."]],
 ["The error output sends failed items down their own path while good items continue.", [null, "Stop Workflow fails everything.", "Schedules don't handle errors.", "Limit doesn't handle errors."]],
 ["The Error Trigger starts the error workflow when another workflow fails.", [null, "Webhook is an HTTP entry point.", "Form Trigger starts from a form.", "Wait only pauses."]],
 ["Searching before creating (upsert) means re-runs don't create duplicates: idempotent.", [null, "It adds a call, so it isn't always faster.", "It is a safety improvement.", "Event-driven is a different concept."]]
],
"subworkflows": [
 ["Sub-workflows start with the Execute Workflow Trigger (\"When executed by another workflow\").", [null, "A Schedule Trigger starts by time.", "A Webhook starts by HTTP.", "Merge isn't a trigger."]],
 ["The caller receives the items output by the sub-workflow's last node.", [null, "Data does come back.", "The full items come back, not just an ID.", "Credentials never travel between workflows."]],
 ["Exports contain nodes, settings and connections; credentials are referenced by name, without secrets.", ["Secrets aren't exported.", null, "Executions are stored separately.", "The encryption key is never exported."]],
 ["Separate instances keep tests away from real data, credentials and webhooks.", ["Cost isn't the goal.", null, "n8n doesn't require it, but it's best practice.", "Speed isn't the reason."]]
],
"security-hosting": [
 ["N8N_ENCRYPTION_KEY encrypts stored credentials; without it they can't be decrypted.", ["Losing it breaks every stored credential.", null, "Speed is unaffected.", "Webhook visibility is unrelated."]],
 ["PostgreSQL is recommended for production and required for queue mode setups.", ["SQLite is for small or test instances.", null, "CSV isn't a database option.", "Redis is the queue, not the main database."]],
 ["In queue mode, workers pull jobs from Redis and run the executions.", ["Executions run on the server, not in the browser.", null, "The database stores data, not runs.", "The load balancer only routes traffic."]],
 ["n8n 2.x disables risky nodes like Execute Command by default.", [null, "Webhooks should be authenticated.", "Credentials are never exported with secrets.", "Env access is blocked in Code by default."]]
],
"ai-agents": [
 ["A Structured Output Parser forces and validates a JSON format you can route on.", ["Prompt wording alone isn't reliable.", null, "Merge combines branches.", "Higher temperature makes output less predictable."]],
 ["The AI Agent node puts its answer in output.", [null, "$env is for environment variables.", "body is webhook data.", "$workflow is metadata."]],
 ["Draft, then require human approval for risky actions such as refunds.", ["Full admin access maximizes damage from mistakes or injection.", null, "Hiding names isn't a security control.", "Bigger models can still be manipulated."]],
 ["The workflow tool lets an agent call one of your n8n workflows.", [null, "Schedule Trigger starts runs on a timer.", "Notes aren't tools.", "Limit cuts lists."]]
],
"rag-documents": [
 ["RAG grounds answers in your documents and updates by re-ingesting, with no retraining.", [null, "RAG needs documents.", "Retrieval adds a step, so it isn't always faster.", "RAG does not retrain the model."]],
 ["Overlap keeps sentences and ideas that cross chunk boundaries.", ["It uses a bit more storage, which isn't the goal.", null, "Postgres doesn't require overlap.", "Overlap has nothing to do with sources."]],
 ["Embeddings map text to vectors where similar meanings are close together.", ["Encryption is unrelated.", null, "They don't compress files.", "They don't translate."]],
 ["Fix retrieval first: chunking, metadata, top K and the documents themselves.", ["The prompt can't use context it never received.", null, "Temperature doesn't fix missing context.", "The webhook is unrelated."]]
],
"capstone": [
 ["Cheap validation first avoids AI cost on bad data and lets you answer with a clear 422.", ["AI reads JSON fine.", null, "n8n doesn't require it.", "Slack speed is unrelated."]],
 ["Respond to Webhook with 201 and the contact id gives the form a clear success answer.", ["Callers need an answer.", null, "Never return credentials.", "Never return the workflow definition."]],
 ["Document purpose, trigger URL, credential names, error alerts and owner, never the secrets.", ["Secrets never go in documents.", null, "Personal passwords never go in documents.", "The canvas alone doesn't explain ownership and operations."]],
 ["Care plans cover monitoring, updates and small changes after launch.", [null, "Websites are a separate service.", "New workflows are separate projects.", "Hardware isn't part of it."]]
]
};

/* merge into the lessons (loaded after lessons, before app.js) */
(function (E) { (window.LESSONS || []).forEach(l => { const x = E[l.id]; if (!x || !l.quiz) return; x.forEach((e, i) => { const q = l.quiz[i]; if (!q || !e) return; if (e[0]) q.why = e[0]; if (e[1]) q.w = e[1]; }); }); })(window.EXPLAIN || {});
