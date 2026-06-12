"""
Audio IO - Microphone recording, Whisper STT, and TTS playback for Jarvis HUD.

Coordinates speech-to-text via OpenAI Whisper and text-to-speech
via Piper (local) or ElevenLabs (cloud) with pygame mixer playback.
"""
import os
import queue
import sounddevice as sd
import soundfile as sf
import whisper
import pygame
from dotenv import load_dotenv

load_dotenv()


class AudioIO:
    """Manages audio capture, transcription, and speech synthesis."""

    def __init__(self, sfx_dir="assets/sounds"):
        pygame.mixer.init()
        self.sfx_dir = sfx_dir
        model_name = os.getenv("WHISPER_MODEL", "base")
        self.whisper_model = whisper.load_model(model_name)

    def play_sfx(self, sfx_name):
        """Play a named sound effect from the assets/sounds directory."""
        path = os.path.join(self.sfx_dir, f"{sfx_name}.wav")
        if os.path.exists(path):
            pygame.mixer.Sound(path).play()

    def record_microphone(self, duration=None, sample_rate=16000):
        """
        Record audio from the default microphone.

        Parameters:
            duration (int): Recording length in seconds. Defaults to .env value.
            sample_rate (int): Sample rate for recording (default 16000 for Whisper).

        Returns:
            str: Path to the temporary WAV file.
        """
        if duration is None:
            duration = int(os.getenv("MIC_RECORD_DURATION", "5"))
        temp_file = "temp_recording.wav"
        recording = sd.rec(
            int(duration * sample_rate),
            samplerate=sample_rate,
            channels=1,
            dtype="int16",
        )
        sd.wait()
        sf.write(temp_file, recording, sample_rate)
        return temp_file

    def transcribe_audio(self, filepath):
        """
        Transcribe a WAV file using Whisper.

        Parameters:
            filepath (str): Path to audio file.

        Returns:
            str: Transcribed text or empty string on failure.
        """
        if not os.path.exists(filepath):
            return ""
        try:
            result = self.whisper_model.transcribe(filepath)
            text = result.get("text", "").strip()
        except Exception:
            text = ""
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
        return text

    def speak(self, text):
        """
        Synthesize and play speech for the given text.

        Supports Piper (local CLI, default) and ElevenLabs (cloud API).
        """
        if not text:
            return
        provider = os.getenv("TTS_PROVIDER", "piper")
        if provider == "elevenlabs":
            from elevenlabs import generate, play

            audio = generate(
                text=text,
                api_key=os.getenv("ELEVENLABS_API_KEY"),
                voice=os.getenv("ELEVENLABS_VOICE_ID"),
            )
            play(audio)
        else:
            # Piper TTS fallback using subprocess
            os.system(
                f'echo "{text}" | piper --model en_US-lessac-medium --output_file speech.wav'
            )
            if os.path.exists("speech.wav"):
                pygame.mixer.music.load("speech.wav")
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)
                os.remove("speech.wav")