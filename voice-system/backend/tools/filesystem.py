import os
from pathlib import Path
from tools.registry import registry, PERMISSION_AUTO
from utils.logger import logger

class FilesystemTool:
    def __init__(self):
        self.desktop_path = Path.home() / "Desktop"

    def write_file(self, filename: str, content: str) -> str:
        """Write content to a file on the desktop."""
        try:
            target = self.desktop_path / filename
            with open(target, "w") as f:
                f.write(content)
            return f"Successfully saved to {target}"
        except Exception as e:
            return f"Failed to write file: {e}"

    def read_file(self, filename: str) -> str:
        """Read content from a file on the desktop."""
        try:
            target = self.desktop_path / filename
            with open(target, "r") as f:
                return f.read()
        except Exception as e:
            return f"Failed to read file: {e}"

fs_tool = FilesystemTool()

@registry.register(
    name="save_to_desktop",
    description="Save text or markdown content to a file on the user's desktop.",
    parameters={
        "type": "object",
        "properties": {
            "filename": {"type": "string", "description": "The name of the file (e.g. 'report.md')."},
            "content": {"type": "string", "description": "The text or markdown content to save."}
        },
        "required": ["filename", "content"]
    },
    permission=PERMISSION_AUTO,
    tags=["filesystem"]
)
async def save_to_desktop(filename: str, content: str) -> str:
    return fs_tool.write_file(filename, content)
