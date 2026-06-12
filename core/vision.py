"""
Vision Capture - Screen capture utilities for Jarvis HUD.

Provides screenshot-to-base64 conversion for vision model queries
via the dual-GPU Ollama pipeline.
"""
import pyautogui
import base64
from io import BytesIO


class VisionCapture:
    """Captures screen content and encodes it for vision LLM processing."""

    @staticmethod
    def capture_screen_base64():
        """
        Take a screenshot and return it as a base64-encoded JPEG string.

        Returns:
            str: Base64-encoded JPEG image data.
        """
        screenshot = pyautogui.screenshot()
        buffered = BytesIO()
        screenshot.save(buffered, format="JPEG", quality=85)
        return base64.b64encode(buffered.getvalue()).decode("utf-8")