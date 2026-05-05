# Conventions

## Deployment
- **Git Repository:** Always push changes to `https://github.com/Sparkozzy/call_form_front.git`.
- **Branch:** Use the `main` branch for all production-ready code.
- **Workflow:** Every code change should be followed by a `git push` to ensure the server (Easypanel) can rebuild.

## EDW Standards
- **Traceability:** Maintain `workflow_id`, `from_workflow`, and `execution_id`.
- **Timezones:** Use UTC for persistence, `America/Sao_Paulo` for internal logic.
- **Environment Variables:** Never push `.env` files to the repository.
