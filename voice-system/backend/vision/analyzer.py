import os
import time
import cv2
import numpy as np
import pyautogui
import pytesseract
from PIL import Image
from utils.logger import logger, log_latency
from config.settings import get_settings

settings = get_settings()

class VisionAnalyzer:
    def __init__(self):
        self.yolo_model = None
        # Heuristic for Tesseract path on macOS (Homebrew default)
        if os.path.exists("/opt/homebrew/bin/tesseract"):
            pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"
        elif os.path.exists("/usr/local/bin/tesseract"):
            pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"

    def _load_yolo(self):
        if self.yolo_model is None:
            try:
                from ultralytics import YOLO
                # Load a small pretrained model for UI detection if available, 
                # or just use yolov8n as a base
                logger.info("Loading YOLOv8 model...")
                self.yolo_model = YOLO("yolov8n.pt") 
                logger.info("YOLOv8 loaded.")
            except Exception as e:
                logger.error(f"Failed to load YOLO: {e}")
        return self.yolo_model

    def capture_screen(self, region=None) -> Image.Image:
        """Capture the screen or a specific region."""
        return pyautogui.screenshot(region=region)

    def extract_text(self, image: Image.Image) -> str:
        """Perform OCR on the image."""
        t0 = time.perf_counter()
        try:
            text = pytesseract.image_to_string(image)
            log_latency("OCR", (time.perf_counter() - t0) * 1000)
            return text.strip()
        except Exception as e:
            logger.warning(f"OCR failed: {e}")
            return ""

    def detect_elements(self, image: Image.Image):
        """Detect UI elements using YOLO."""
        model = self._load_yolo()
        if not model:
            return []
        
        t0 = time.perf_counter()
        # Convert PIL to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        results = model(img_cv, conf=0.25, verbose=False)
        
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls[0])],
                    "conf": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist() # [x1, y1, x2, y2]
                })
        
        log_latency("ObjectDetection", (time.perf_counter() - t0) * 1000)
        return detections

    def analyze_scene(self) -> dict:
        """Full screen analysis: Screenshot -> OCR -> Detection."""
        t0 = time.perf_counter()
        screenshot = self.capture_screen()
        
        # 1. OCR for text
        text = self.extract_text(screenshot)
        
        # 2. Element detection
        # elements = self.detect_elements(screenshot)
        elements = [] # Placeholder for now to avoid downloading large weights immediately
        
        analysis = {
            "timestamp": time.time(),
            "screen_size": screenshot.size,
            "detected_text_snippet": text[:500],
            "element_count": len(elements),
            "elements": elements
        }
        
        log_latency("VisionAnalysis_Total", (time.perf_counter() - t0) * 1000)
        return analysis

vision_analyzer = VisionAnalyzer()
