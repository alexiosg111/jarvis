# Jarvis Desktop HUD

A Python-based desktop overlay application featuring a transparent CustomTkinter "Odyssee" HUD with an animated Canvas Orb, LangGraph state-graph orchestrator, Dual-GPU Ollama routing, Qdrant vector memory, and voice IO (Whisper STT + Piper/ElevenLabs TTS).

## Architecture

```
jarvis/
├── main.py                   # Application launcher & hotkey coordinator
├── requirements.txt           # Python dependencies
├── .env                       # Environment configuration
├── core/
│   ├── orchestrator.py        # LangGraph StateGraph brain
│   ├── llm_client.py          # Dual-GPU Ollama router (GPU0/Qwen2.5, GPU1/Qwen2-VL)
│   ├── memory.py              # Qdrant vector store for semantic memory
│   ├── tools.py               # PyAutoGUI + terminal command executor
│   └── vision.py              # Screenshot capture and base64 encoding
├── ui/
│   ├── hud.py                 # Frameless CustomTkinter overlay window
│   ├── orb_widget.py          # Animated Canvas orb (idle/listening/thinking/speaking/executing)
│   └── animations.py          # Fade-in/out and easing helpers
├── utils/
│   ├── audio_io.py            # Sounddevice recorder, Whisper STT, TTS playback
│   └── sfx_generator.py       # Auto-generates WAV sound effects (zero-dependency SFX)
├── assets/
│   └── sounds/                # Auto-generated sound effect library
└── archive/
    └── electron-hud/          # Archived legacy Electron + React + TS codebase
```

## Features

- **Transparent HUD Overlay**: Always-on-top, frameless window with color-key transparency
- **Animated Orb Reactor**: State-driven visual patterns (idle, listening, thinking, speaking, executing)
- **LangGraph Orchestrator**: Structured state-graph workflow for memory lookup, routing, LLM calls, and tool execution
- **Dual-GPU Ollama Routing**: Text queries to Qwen2.5 14B (GPU 0), vision queries to Qwen2-VL 7B (GPU 1)
- **Qdrant Vector Memory**: Semantic memory retrieval via LangChain + HuggingFace embeddings
- **Voice IO**: Microphone recording via sounddevice, speech-to-text via Whisper, text-to-speech via Piper (local) or ElevenLabs (cloud)
- **Desktop Automation**: PyAutoGUI bindings for mouse/keyboard control and headless terminal commands
- **Auto-generated SFX**: Programmatic WAV synthesis for instant zero-dependency audio feedback

## Prerequisites

- Python 3.10+
- Ollama instances (two separate processes):
  - GPU 0 (port 11434): `ollama run qwen2.5:14b`
  - GPU 1 (port 11435): `ollama run qwen2-vl:7b`
- Qdrant vector database (optional, for memory persistence): `docker run -p 6333:6333 qdrant/qdrant`
- Piper TTS (optional, for local speech synthesis): Install `piper-tts` package

## Installation

```bash
# Clone the repository
git clone <repo-url> jarvis
cd jarvis

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.local
# Edit .env.local with your settings

# Run the application
python main.py
```

## Usage

1. Launch the application: `python main.py`
2. The transparent HUD window appears on the left side of the screen
3. Press **Ctrl+J** to activate Jarvis
4. Speak your query after the "Jarvis Listening..." prompt
5. Jarvis processes the query through the LangGraph workflow and responds via TTS

### Hotkeys

- `Ctrl+J`: Toggle listening session
- `Escape`: Quit the application

## Configuration

Edit `.env` to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_GPU0_URL` | GPU 0 Ollama endpoint | `http://localhost:11434` |
| `OLLAMA_GPU1_URL` | GPU 1 Ollama endpoint | `http://localhost:11435` |
| `QDRANT_URL` | Qdrant vector DB URL | `http://localhost:6333` |
| `TTS_PROVIDER` | TTS engine (`piper` or `elevenlabs`) | `piper` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | - |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | `21m00Tcm4TlvDq8ikWAM` |
| `WHISPER_MODEL` | Whisper model size | `base` |
| `MIC_RECORD_DURATION` | Recording duration (seconds) | `5` |