"""
LLM Client - Dual-GPU Ollama router for Jarvis HUD.

Routes text-only queries to GPU 0 (Qwen 2.5 14B on port 11434)
and vision queries to GPU 1 (Qwen2-VL 7B on port 11435).
"""
import os
import requests


class DualGPURouter:
    """
    Routes LLM requests across two Ollama instances on separate GPUs.

    - GPU 0 (port 11434): Qwen 2.5 14B for text reasoning and tool calling.
    - GPU 1 (port 11435): Qwen2-VL 7B for vision / screenshot analysis.
    """

    def __init__(self):
        self.gpu0_url = os.getenv("OLLAMA_GPU0_URL", "http://localhost:11434")
        self.gpu1_url = os.getenv("OLLAMA_GPU1_URL", "http://localhost:11435")

    def query_text_model(self, prompt, system_prompt=""):
        """
        Send a text-only prompt to the GPU 0 model (Qwen 2.5 14B).

        Parameters:
            prompt (str): User query text.
            system_prompt (str): Optional system-level instructions.

        Returns:
            str: Model response text.
        """
        payload = {
            "model": "qwen2.5:14b",
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
        }
        try:
            res = requests.post(f"{self.gpu0_url}/api/generate", json=payload, timeout=60)
            res.raise_for_status()
            return res.json().get("response", "")
        except requests.exceptions.RequestException as e:
            return f"[Ollama GPU 0 Error] {str(e)}"

    def query_vision_model(self, prompt, image_b64):
        """
        Send a prompt + base64 image to the GPU 1 vision model (Qwen2-VL 7B).

        Parameters:
            prompt (str): Query about the image content.
            image_b64 (str): Base64-encoded JPEG image.

        Returns:
            str: Model response text.
        """
        payload = {
            "model": "qwen2-vl:7b",
            "prompt": prompt,
            "images": [image_b64],
            "stream": False,
        }
        try:
            res = requests.post(f"{self.gpu1_url}/api/generate", json=payload, timeout=120)
            res.raise_for_status()
            return res.json().get("response", "")
        except requests.exceptions.RequestException as e:
            return f"[Ollama GPU 1 Error] {str(e)}"

    def query_with_context(self, prompt, system_prompt="", context=""):
        """
        Send a text prompt with retrieved memory context.

        Parameters:
            prompt (str): User query.
            system_prompt (str): System instructions.
            context (str): Retrieved memory context.

        Returns:
            str: Model response.
        """
        full_prompt = f"Context:\n{context}\n\nQuery:\n{prompt}" if context else prompt
        return self.query_text_model(full_prompt, system_prompt)