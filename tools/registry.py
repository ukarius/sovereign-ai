"""Allowlisted local tool registry. No shell execution is enabled by default."""
from collections.abc import Callable

class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Callable[..., str]] = {}

    def register(self, name: str, handler: Callable[..., str]) -> None:
        if not name or name in self._tools:
            raise ValueError(f"Invalid or duplicate tool name: {name!r}")
        self._tools[name] = handler

    def call(self, name: str, **arguments: str) -> str:
        try:
            handler = self._tools[name]
        except KeyError as exc:
            raise PermissionError(f"Tool is not allowlisted: {name}") from exc
        return handler(**arguments)

def default_registry() -> ToolRegistry:
    return ToolRegistry()
