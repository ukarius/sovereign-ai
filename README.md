# Sovereign AI

Sovereign AI is a local-first project for self-hosted workflows, secure memory handling, and local tool execution. This repository currently contains an existing creator-economy web application (FastAPI/SQLite API, Spring Boot services, and React frontend) alongside a new, minimal Python agent-runtime foundation. The runtime is deliberately small and does not claim model inference or a hardened security sandbox yet.

## Architecture

- `core/`: deterministic orchestration entry point and response types.
- `models/`: model interface boundary; local runtime adapters can be added here.
- `tools/`: allowlisted tool registry. The default registry exposes no capabilities and never invokes a shell.
- `config/`: conservative default security policy (network, shell, and filesystem writes disabled).
- `tests/`: location for unit and integration coverage.
- `backend/`, `frontend/`, `landing/`: existing creator-economy application components.

The engine is dependency-light. FastAPI, Pydantic, and Rich are declared for API/configuration/UI extensions. PyTorch and Transformers are optional under the `local-models` extra because they are large and hardware dependent.

## Quick start

Python 3.10+:

```bash
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -e .
python -m core "Summarize a local task"
```

The starter runtime returns a local acknowledgement. It does not call a hosted service or load model weights. Install the optional inference dependencies with `python -m pip install -e '.[local-models]'` when implementing a local adapter.

## Existing web application

The repository also includes the prior application. See its existing compose files and `backend/` and `frontend/` setup. Configure secrets through environment variables; never commit `.env` files or local database contents.

## Security model and limits

The starter runtime has no network client, shell executor, or filesystem writer. Tools must be registered explicitly and calls to unknown tool names are rejected. These defaults reduce accidental capabilities; they are not a complete operating-system sandbox. When adding tools, validate arguments, constrain file paths, use least-privilege processes, and add explicit consent for consequential actions. Treat prompts and model outputs as untrusted input. Local inference does not by itself guarantee confidentiality if logs, checkpoints, or telemetry leave the host.

## Configuration

`config/security.yaml` documents conservative runtime defaults. Runtime policy enforcement should remain in code, not depend solely on configuration. Store credentials in environment variables or a secret manager and keep local model weights out of Git.

## Development

Add unit and integration coverage under `tests/`. Keep optional model backends separate from the minimal runtime so a CPU-only/offline setup can install the core package without downloading model weights.

## License

MIT (add the repository license file before distributing under this license).
