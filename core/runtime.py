"""Small deterministic runtime that is safe to import and run locally."""
from dataclasses import dataclass
from tools.registry import ToolRegistry, default_registry

@dataclass(frozen=True)
class AgentResponse:
    text: str
    tool_name: str | None = None

class Agent:
    """Starter orchestration loop; model and tool execution are injected explicitly."""
    def __init__(self, tools: ToolRegistry | None = None) -> None:
        self.tools = tools or default_registry()

    def respond(self, prompt: str) -> AgentResponse:
        prompt = prompt.strip()
        if not prompt:
            raise ValueError("Prompt must not be empty")
        return AgentResponse(text=f"Local runtime ready. Received: {prompt}")
