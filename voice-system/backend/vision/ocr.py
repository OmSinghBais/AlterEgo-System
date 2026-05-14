"""
AlterEGO — OCR Engine
Extracts text from screenshots using macOS native Vision framework.
Falls back to GPT-4o vision if native OCR fails.
"""

import subprocess
import tempfile
import time
from pathlib import Path
from tools.registry import registry, PERMISSION_AUTO
from utils.logger import logger


def _macos_ocr(image_path: str) -> str:
    """
    Uses macOS native Vision framework for OCR via a Swift one-liner.
    This is extremely fast and works offline.
    """
    script = f'''
    import Cocoa
    import Vision

    let url = URL(fileURLWithPath: "{image_path}")
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {{
        print("ERROR: Could not load image")
        exit(1)
    }}

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true

    let handler = VNImageRequestHandler(cgImage: cgImage)
    try handler.perform([request])

    let results = request.results ?? []
    for observation in results {{
        print(observation.topCandidates(1).first?.string ?? "")
    }}
    '''

    try:
        result = subprocess.run(
            ["swift", "-e", script],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception as e:
        logger.warning(f"macOS native OCR failed: {e}")

    return None


@registry.register(
    name="read_screen_text",
    description="Extract all visible text from the current screen or a screenshot using OCR.",
    parameters={
        "type": "object",
        "properties": {
            "image_path": {"type": "string", "description": "Optional path to image. If empty, captures current screen."}
        }
    },
    permission=PERMISSION_AUTO,
    tags=["vision", "ocr"]
)
async def read_screen_text(image_path: str = None) -> str:
    from vision.screen_capture import capture_screen

    if not image_path:
        path = capture_screen()
    else:
        path = Path(image_path)

    if not path or not path.exists():
        return "Error: Could not capture or find screen image."

    # Try native macOS OCR first (fast, offline)
    text = _macos_ocr(str(path))
    if text:
        logger.info(f"📝 OCR extracted {len(text)} chars (native)")
        return f"[OCR Result]\n{text}"

    # Fallback: Use GPT-4o Vision for OCR
    logger.info("📝 Falling back to GPT-4o for OCR...")
    from vision.reasoning import analyze_screen
    return await analyze_screen(
        query="Extract ALL visible text from this screenshot. Return it verbatim.",
        image_path=str(path)
    )
