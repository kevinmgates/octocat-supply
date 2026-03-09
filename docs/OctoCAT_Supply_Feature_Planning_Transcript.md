# OctoCAT Supply
## Feature Planning Meeting – Sprint Kickoff

| | |
|---|---|
| **Date** | Monday, March 9, 2026 |
| **Time** | 10:00 AM – 11:30 AM CT |
| **Location** | Microsoft Teams / Chicago (River North Office) |
| **Project** | OctoCAT Supply – Feature Planning Sprint |
| **Repo** | github.com/kevinmgates/octocat-supply |
| **Facilitator** | Kevin Gates (Solution Engineer) |
| **Attendees** | Kevin Gates, Priya Nair (Backend Dev), Marcus Webb (Frontend Dev), Danielle Cho (Product), Jordan Reyes (AI/ML) |
| **Note-taker** | Danielle Cho |

---

## Agenda

- Welcome & Repo Context (5 min)
- Feature 1: AI Customer Service Agent – Microsoft Azure AI Foundry (30 min)
- Feature 2: Intelligent Order Anomaly Detection (20 min)
- Feature 3: GitHub Copilot-Assisted API Documentation Generator (15 min)
- Action Items & Next Steps (10 min)

---

## 1. Welcome & Repo Context

**Kevin:** Good morning everyone. Thanks for joining. Quick reminder of where we are — OctoCAT Supply is our flagship GitHub Copilot demo repo. It showcases AI-assisted development across the full stack: React frontend, Express API, TypeScript, Docker, GHAS scanning, MCP server integration, and CI/CD. Today we're planning three new features that will make this an even richer demo, especially for customers evaluating Microsoft AI tooling.

**Danielle:** Can you remind us of the primary demo audience?

**Kevin:** Primarily solution engineers demoing to enterprise customers interested in GitHub Copilot, GHAS, and the Microsoft AI stack. The app itself is an e-commerce supply company theme — headquarters, branches, orders, deliveries. Believable enough to feel real, but totally synthetic data, so no worries there.

**Priya:** Got it. And the three features we're scoping today — are these all going into main or will we branch them?

**Kevin:** Each gets its own feature branch. We'll open PRs and use them as demo material for Copilot code review and GHAS scanning. That's part of the point — the development process is the demo, not just the end result.

---

## 2. Feature 1: AI Customer Service Agent (Microsoft Azure AI Foundry)

### Context & Motivation

**Kevin:** This is the headline feature for today. We want to add a customer service chat agent to OctoCAT Supply powered by Microsoft Azure AI Foundry — formerly known as Azure AI Studio. The idea is that a customer browsing the site can open a chat panel, ask questions about orders, products, delivery status, and get intelligent responses backed by the app's own data.

**Jordan:** Love it. Azure AI Foundry gives us the agent orchestration layer — we can ground it with the existing order and product data through Azure AI Search or direct tool calls to our Express API. Are we thinking RAG, tool-use agents, or both?

**Kevin:** Both, ideally. RAG for product catalog queries — "do you carry X", "what's the return policy" — and tool-calling agents for dynamic order lookups. So the agent can actually call our existing REST endpoints at runtime.

**Jordan:** That's achievable. Azure AI Foundry supports multi-agent orchestration now. We could define a primary customer service agent and sub-agents for order tracking and product lookup. The Foundry SDK handles the routing.

**Priya:** On the backend, I'd suggest we add a new route under `/api/agent` — a POST endpoint that proxies to the Foundry inference endpoint. That keeps the frontend clean and means we can swap out models without touching React. We'll also need to wire up the Azure AI Search index over the product catalog.

**Marcus:** Frontend side, I'm thinking a floating chat widget. We can do it in the existing React stack — a `ChatPanel` component that lives outside the main router, always accessible. State managed locally or with a small Zustand store. I'll use Copilot Agent Mode to generate the component from a wireframe sketch.

**Kevin:** Perfect — that's a great Copilot vision demo moment. Marcus, can you grab a rough mockup from Figma or even just describe it to Copilot and let it generate from that?

**Marcus:** Already planning on it. I'll screenshot a ChatGPT-style widget design and paste it into Copilot. Should be a clean demo of Copilot understanding UI intent from an image.

**Danielle:** For the demo script, the killer moment is: customer asks "Where is order 1042?" and the agent calls the live `/api/orders/:id` endpoint, gets the delivery status, and responds in natural language. That's the wow.

**Kevin:** Exactly. And we'll show the Foundry portal — the agent playground, the evaluation tab, the deployment endpoint. Lots of surface area to demo. Jordan, can you own the Foundry provisioning and SDK integration?

**Jordan:** Yes, I'll set up the Azure AI Foundry project, define the agent with its tools and grounding config, and document the environment variables needed. I'll write a `foundry-setup.md` in the docs folder.

### Technical Decisions

- New backend route: `POST /api/agent/chat` — proxies to Azure AI Foundry inference endpoint
- Azure AI Search index over product catalog (JSON product fixtures)
- Agent defined in Foundry with two tools: `get_order_status` (calls `/api/orders/:id`) and `search_products` (calls AI Search)
- Frontend: new `ChatPanel` React component with floating trigger button
- Auth: API key stored in Azure Key Vault, surfaced via environment variable to the Express backend
- New branch: `feature/ai-customer-service-agent`

---

## 3. Feature 2: Intelligent Order Anomaly Detection

### Context & Motivation

**Kevin:** Feature two is order anomaly detection — a backend service that scans incoming orders and flags unusual patterns. Think duplicate orders, orders with suspiciously large quantities, orders from branches that don't match typical geography, that kind of thing. We'll surface flags in the admin view.

**Priya:** This is a great fit for a lightweight ML model or even a rules engine that Copilot helps us build. I'm thinking we add an anomaly service that runs as middleware on order creation. It scores each order and attaches an `anomaly_score` and `anomaly_flags` array to the response.

**Jordan:** We could use Azure AI Foundry here too — a fine-tuned classification model or just a prompt-based classifier with structured output. Pass the order JSON to GPT-4o with a system prompt that defines normal vs anomalous patterns. It returns a JSON object with score, flags, and reasoning. Very demonstrable.

**Kevin:** I like the AI-based approach for demo value. The reasoning field is important — customers love seeing explainability. "This order was flagged because the quantity is 4x the branch average."

**Danielle:** For the frontend, Marcus, could we add a small badge on the order list? Like a yellow warning triangle with a tooltip showing the flags?

**Marcus:** Easy. I'll add an `AnomalyBadge` component. Copilot should generate that in about thirty seconds given the existing component patterns in the repo. I'll also add a filter in the admin order table — "Show flagged orders only."

**Priya:** I'll add a new `OrderAnomalyService` class in the API. It'll be called from the order controller after order creation. I want to make sure it's async and non-blocking — anomaly scoring shouldn't slow down order confirmation.

**Kevin:** Agreed. Fire and forget with a webhook or event to update the order record asynchronously. Good microservices pattern to demonstrate too.

### Technical Decisions

- New service: `OrderAnomalyService` — async, non-blocking, called post-order creation
- GPT-4o via Azure AI Foundry for anomaly classification with structured JSON output
- Response shape: `{ anomaly_score: 0–1, flags: string[], reasoning: string }`
- New DB column / order field: `anomaly_score`, `anomaly_flags`
- Frontend: `AnomalyBadge` component + "Flagged Orders" filter in admin table
- New branch: `feature/order-anomaly-detection`

---

## 4. Feature 3: GitHub Copilot-Assisted API Documentation Generator

### Context & Motivation

**Kevin:** Feature three is a little meta but perfect for the demo. We want to add a GitHub Actions workflow that runs on PR, uses Copilot and the GitHub Models API to read the Express routes and auto-generate or update the OpenAPI spec in `docs/`. This demonstrates AI in the CI/CD pipeline — not just in the editor.

**Priya:** We already have some OpenAPI/Swagger scaffolding in the `api` folder. The idea would be: on PR, a workflow extracts the TypeScript route definitions, sends them to a model via GitHub Models, gets back updated OpenAPI YAML, and commits it as a bot commit — or opens a review comment with the diff.

**Marcus:** I love the review comment approach. Less risky than auto-committing, and it gives us a great demo moment — the PR has a Copilot bot comment with the suggested documentation update, and the reviewer can approve it.

**Kevin:** Exactly. We're demonstrating the full loop: developer writes a new endpoint, opens a PR, Copilot reviews the code for security via GHAS, and a separate workflow proposes documentation updates. That's the AI-augmented developer lifecycle.

**Jordan:** For the model call, GitHub Models gives us access to GPT-4o and others directly from Actions via the `GITHUB_TOKEN`. No extra credentials needed. We pass the route file content as context and prompt it to produce OpenAPI YAML for each route.

**Danielle:** From a docs perspective, we should add a section to the `demo-script.md` about this workflow — walking through the PR timeline showing the bot comments. That's a two-minute wow moment in a live demo.

**Kevin:** Good call. Jordan, can you write the Actions workflow? And Priya, let's make sure the route files are clean and well-commented so the model has good signal to work from.

**Priya:** I'll do a cleanup pass on the route files this week. Add JSDoc comments to each handler. That'll help both Copilot in-editor and the doc generation workflow.

### Technical Decisions

- New GitHub Actions workflow: `.github/workflows/api-docs-generator.yml`
- Trigger: `pull_request` targeting `main`, paths: `api/**`
- Model: GPT-4o via GitHub Models API, authenticated with `GITHUB_TOKEN`
- Workflow steps: checkout → extract routes → call model → post PR review comment with OpenAPI diff
- No auto-commit — use PR review comment for human approval
- New branch: `feature/copilot-api-doc-generator`

---

## 5. Action Items & Next Steps

| Owner | Action Item | Due |
|---|---|---|
| Jordan Reyes | Provision Azure AI Foundry project; define agent with order + product tools; write `foundry-setup.md` | Mar 14 |
| Priya Nair | Create `POST /api/agent/chat` route; build `OrderAnomalyService`; clean up API route JSDoc comments | Mar 16 |
| Marcus Webb | Build `ChatPanel` React component (Copilot vision demo); build `AnomalyBadge` component + admin filter | Mar 16 |
| Jordan Reyes | Write GitHub Actions workflow for API doc generation using GitHub Models | Mar 14 |
| Kevin Gates | Update `demo-script.md` with all three feature walkthroughs; open feature branches | Mar 11 |
| Danielle Cho | Create GitHub Issues for all three features; add acceptance criteria and demo notes | Mar 11 |
| All | PR review of each feature branch before Mar 20 sprint review | Mar 20 |

---

## 6. Closing Remarks

**Kevin:** Great session. Three solid features — the customer service agent is the crown jewel for Microsoft AI Foundry demos, the anomaly detection adds depth for enterprise risk conversations, and the doc generator workflow is a fantastic CI/CD + Copilot story. Let's get the branches up today and start making progress.

**Danielle:** I'll have the GitHub Issues created before EOD. I'll tag them with the relevant Copilot demo tags so they show up nicely in the project board.

**Priya:** Quick question before we close — for the Foundry agent, should I assume GPT-4o as the base model, or should Jordan decide?

**Jordan:** GPT-4o for sure. Best tool use reliability and structured output support. I'll pin the model version in the Foundry deployment config so the demo is stable.

**Kevin:** Perfect. Thanks everyone. Recording will be in the Teams channel. Next sync is Thursday.

---

*— End of Transcript —*
