"""Optional local model adapter boundary; concrete runtimes can implement this protocol."""
from typing import Protocol

class TextModel(Protocol):
    def generate(self, prompt: str) -> str: ...
