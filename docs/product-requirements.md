# Product Requirements Document (PRD)
## OctoCAT Supply – Sprint Feature Set (March 2026)

## 1. Document Control

- **Project:** OctoCAT Supply
- **Source:** Feature Planning Meeting Transcript
- **Meeting Date:** March 9, 2026
- **PRD Version:** 1.0
- **Last Updated:** March 9, 2026
- **Primary Audience:** Solution Engineers, Product, Engineering

## 2. Product Context

OctoCAT Supply is a demo application used to showcase GitHub Copilot, GitHub Advanced Security (GHAS), and Microsoft AI capabilities across a full-stack TypeScript application.

This PRD defines the sprint feature set agreed during the March 9, 2026 planning session. The goal is to increase demo impact by showing AI-enabled customer experience, intelligent operational insights, and AI-assisted developer workflow automation.

## 3. Goals and Success Criteria

### 3.1 Goals

1. Add an AI-powered customer service experience grounded in OctoCAT data.
2. Add anomaly intelligence to order workflows for risk and operations conversations.
3. Add AI-assisted API documentation generation in the PR lifecycle.

### 3.2 Business/Demo Outcomes

- Improve enterprise demo narrative for Microsoft AI Foundry and GitHub Copilot.
- Demonstrate end-to-end AI value across runtime UX, backend intelligence, and CI/CD.
- Produce reusable feature branches and PR artifacts for customer-facing walkthroughs.

### 3.3 Success Metrics

- Demo script includes all three features and can be executed end-to-end without manual workarounds.
- Customer service chat successfully answers product questions and resolves order status lookup by order ID.
- New orders can be scored for anomaly risk and surfaced in admin UX.
- Pull requests touching API routes receive generated OpenAPI suggestions via workflow comment.

## 4. Users and Personas

- **Primary User (Demo):** Solution Engineer presenting AI capabilities.
- **Secondary User (App End User):** Customer browsing products and tracking orders.
- **Secondary User (Admin Persona):** Internal operations user reviewing order anomalies.
- **Developer Persona:** Engineers using Copilot/GitHub workflows to maintain API docs.

## 5. Scope

### 5.1 In Scope (This Sprint)

1. AI Customer Service Agent (Azure AI Foundry)
2. Intelligent Order Anomaly Detection
3. Copilot-Assisted API Documentation Generator (GitHub Actions)

### 5.2 Out of Scope

- Production-grade customer authentication redesign
- Full fraud platform or model training pipeline
- Automatic merge/commit of generated API specs without human review
- Any redesign of existing entity model outside fields required for anomaly support

## 6. Feature Requirements

## Feature 1: AI Customer Service Agent

### Objective
Provide a customer-facing chat experience that can answer product and order questions using app data.

### Functional Requirements

- Add backend endpoint: `POST /api/agent/chat`.
- Endpoint proxies prompts to Azure AI Foundry inference endpoint.
- Agent must support grounded product Q&A via Azure AI Search.
- Agent must support runtime order status lookups via tool call to existing order API (e.g., `/api/orders/:id`).
- Frontend must include an always-accessible floating chat widget (`ChatPanel`).
- Backend must support environment-based configuration for Foundry endpoint/model and secrets.
- API key handling must use secure secret storage practices (Azure Key Vault + environment variable consumption pattern).

### Non-Functional Requirements

- Chat response latency should be demo-friendly (target: first response within a few seconds under normal demo conditions).
- Errors from upstream AI services must return user-safe fallback messaging.
- Agent integration should be swappable by backend configuration without frontend code changes.

### Acceptance Criteria

- User can open chat from any main app screen.
- Prompt "Where is order 1042?" returns a natural-language status answer based on order endpoint data.
- Product discovery prompts return grounded responses aligned with catalog data.
- If AI service is unavailable, UI shows clear error state and app remains usable.

## Feature 2: Intelligent Order Anomaly Detection

### Objective
Detect and explain unusual order behavior, then surface actionable indicators to admins.

### Functional Requirements

- Add `OrderAnomalyService` in API.
- Service runs asynchronously after order creation (non-blocking for order confirmation).
- Service sends order payload to GPT-4o (via Azure AI Foundry) and expects structured JSON output.
- Output schema: `{ anomaly_score: number, flags: string[], reasoning: string }`.
- Persist anomaly data to order record using new fields (`anomaly_score`, `anomaly_flags`).
- Frontend admin order view displays an `AnomalyBadge` indicator for flagged orders.
- Frontend admin order view supports filter: "Flagged Orders".

### Non-Functional Requirements

- Order creation must not fail solely because anomaly scoring fails.
- Scoring should complete asynchronously and update records reliably.
- Reasoning text should be concise and understandable for demos.

### Acceptance Criteria

- New order creation flow remains responsive with anomaly scoring executed post-create.
- Flagged orders show visible badge and can be filtered in admin UI.
- Stored anomaly fields are queryable and returned by order API.
- At least one demo scenario shows explainable flag reasoning (e.g., unusually high quantity).

## Feature 3: Copilot-Assisted API Documentation Generator

### Objective
Automate OpenAPI documentation assistance during pull request review.

### Functional Requirements

- Add workflow file: `.github/workflows/api-docs-generator.yml`.
- Workflow triggers on `pull_request` to `main` when changes occur under `api/**`.
- Workflow extracts route definitions and relevant API context.
- Workflow calls GPT-4o via GitHub Models using `GITHUB_TOKEN`.
- Workflow posts PR review comment with proposed OpenAPI updates/diff.
- Workflow must not auto-commit generated docs in MVP.

### Non-Functional Requirements

- Workflow must produce deterministic, readable comment output.
- Failures should be surfaced as workflow status with actionable logs.
- Generated suggestion quality depends on route comments; route handlers should include clear JSDoc.

### Acceptance Criteria

- API route changes in PR trigger the workflow.
- PR receives bot-generated documentation suggestion comment.
- Reviewer can evaluate suggestion without merging generated code automatically.
- Demo script can show this flow as part of AI-augmented SDLC narrative.

## 7. Dependencies

- Azure AI Foundry project and model deployment (GPT-4o)
- Azure AI Search index over product catalog
- Azure Key Vault (or equivalent secure secret management flow)
- Existing order/product APIs in Express backend
- GitHub Actions and GitHub Models availability for repository

## 8. Risks and Mitigations

- **Risk:** AI response inconsistency during live demo  
  **Mitigation:** Pin model/version where possible; script known-good prompts.
- **Risk:** External service latency or availability impacts demo flow  
  **Mitigation:** Add graceful fallback and pre-validated backup scenario.
- **Risk:** Low-quality generated OpenAPI suggestions  
  **Mitigation:** Improve route JSDoc and constrain prompt/output format.
- **Risk:** Anomaly scoring false positives reduce credibility  
  **Mitigation:** Display reasoning and position as assistive signal, not hard block.

## 9. Delivery Plan and Ownership

| Owner | Deliverable | Due |
|---|---|---|
| Jordan Reyes | Foundry provisioning, agent/tool config, `foundry-setup.md` | Mar 14, 2026 |
| Priya Nair | `POST /api/agent/chat`, `OrderAnomalyService`, route JSDoc cleanup | Mar 16, 2026 |
| Marcus Webb | `ChatPanel`, `AnomalyBadge`, admin flagged filter | Mar 16, 2026 |
| Jordan Reyes | `.github/workflows/api-docs-generator.yml` | Mar 14, 2026 |
| Kevin Gates | Demo script updates, feature branch orchestration | Mar 11, 2026 |
| Danielle Cho | GitHub issues with acceptance criteria/demo notes | Mar 11, 2026 |
| All | PR review completion for sprint review | Mar 20, 2026 |

## 10. Branching Strategy

- `feature/ai-customer-service-agent`
- `feature/order-anomaly-detection`
- `feature/copilot-api-doc-generator`

## 11. Open Questions

1. Final schema migration strategy for anomaly fields (if persistent DB is used beyond seed data).
2. Exact fallback UX copy for chat/anomaly service failure paths.
3. Whether to retain PR comment-only approach long term or add opt-in auto-apply flow later.

## 12. Sign-off

This PRD captures decisions from the March 9, 2026 feature planning meeting transcript and is intended as the implementation baseline for the current sprint.