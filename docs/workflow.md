# Workflow: Call Form Front

## Objective
Provide a user interface for users to manually trigger outbound calls by sending lead information to the `pre_call_processing` workflow.

## Steps
1. **User Input:** User fills the form with Name, Phone, and Business Context.
2. **Payload Construction:** The frontend constructs a JSON payload mapping the "context" field correctly for the AI.
3. **API Request:** Send the data to the backend endpoint.
4. **EDW Integration:** Ensure the request is tracked and follows the MindFlow architecture.
