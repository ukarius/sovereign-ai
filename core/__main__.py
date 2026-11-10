"""Command-line entry point for a smoke-free local runtime demonstration."""
import argparse
from core import Agent

def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Sovereign AI starter runtime")
    parser.add_argument("prompt", help="Text to pass to the local runtime")
    args = parser.parse_args()
    print(Agent().respond(args.prompt).text)

if __name__ == "__main__":
    main()
