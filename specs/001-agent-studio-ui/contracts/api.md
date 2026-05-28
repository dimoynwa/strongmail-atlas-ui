# API Contracts: Agent Studio UI

**Date**: 2026-05-27

This document defines the expected request/response contracts for the FastAPI backend that the React frontend will interact with.

## `POST /session`
Initialize a new editing session for a template.

**Request**
```json
{
  "template_name": "welcome_email",
  "lang_local": "en-US",
  "param_cust_brand": "brand_a"
}
```

**Response**
```json
{
  "session_id": "uuid-string"
}
```

## `GET /working-copy/{session_id}`
Fetch the current state of the template variables.

**Response**
```json
{
  "working_copy": {
    "header_text": "Welcome to our service!",
    "body_text": "We are glad you are here."
  },
  "modified_keys": ["header_text"]
}
```

## `PATCH /working-copy/{session_id}`
Update specific keys in the working copy.

**Request**
```json
{
  "updates": {
    "header_text": "Welcome to the premium service!"
  }
}
```

**Response**
```json
{
  "status": "success"
}
```

## `DELETE /working-copy/{session_id}`
Reset the working copy to its original template state.

**Response**
```json
{
  "status": "success"
}
```

## `GET /preview/{session_id}`
Fetch the rendered HTML for the current working copy.

**Response**
```json
{
  "html": "<!DOCTYPE html><html><body><h1>Welcome...</h1></body></html>"
}
```

## `POST /tone/evaluate/{session_id}`
Evaluate the emotional tone of the current working copy.

**Response**
```json
{
  "scores": {
    "urgency": 10,
    "anger": 5,
    "joy": 80,
    "neutral": 20
  },
  "baseline_scores": {
    "urgency": 12,
    "anger": 4,
    "joy": 75,
    "neutral": 25
  }
}
```

## `POST /tone/apply/{session_id}`
Apply suggested rewrites to the working copy.

**Request**
```json
{
  "keys": ["header_text"] // Optional. If omitted or empty, applies all.
}
```

**Response**
```json
{
  "status": "success"
}
```

## `POST /tone/undo/{session_id}`
Revert the last tone application.

**Response**
```json
{
  "status": "success"
}
```

## `GET /health`
Poll for component health.

**Response**
```json
{
  "status": "ok",
  "components": {
    "redis": "ok",
    "postgres": "ok",
    "adk": "degraded"
  }
}
```

## `POST /chat/stream`
Stream a chat response from the agent. Uses SSE format via `fetch` + `ReadableStream`.

**Request**
```json
{
  "session_id": "uuid-string", // Nullable for general agent
  "agent": "template", // or "general"
  "message": "Make it sound more urgent"
}
```

**Response (SSE Stream)**
```text
data: {"type": "tool", "name": "analyze_tone"}

data: {"type": "token", "text": "I've "}

data: {"type": "token", "text": "updated "}

data: {"type": "final", "text": "I've updated the text to be more urgent.", "diff": {"header_text": {"old": "Welcome", "new": "Act now!"}}, "snapshot_overwritten": false}
```