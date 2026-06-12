"""
SFX Generator - Programmatic Audio Synthesis for Jarvis HUD

Auto-generates WAV feedback sounds if asset files are missing,
ensuring zero-dependency, out-of-the-box audio functionality.
"""
import os
import numpy as np
from scipy.io import wavfile


def generate_beep(filepath, freq1, freq2, duration, sample_rate=44100):
    """
    Generate a WAV file with a pitch sweep from freq1 to freq2.

    Parameters:
        filepath (str): Output file path.
        freq1 (float): Starting frequency in Hz.
        freq2 (float): Ending frequency in Hz.
        duration (float): Sound length in seconds.
        sample_rate (int): Samples per second (default 44100).
    """
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    frequencies = np.linspace(freq1, freq2, len(t))
    wave = np.sin(2 * np.pi * frequencies * t)

    # Apply fade-in/out envelope to avoid clicks
    envelope = np.ones_like(t)
    fade_len = int(sample_rate * 0.05)
    envelope[:fade_len] = np.linspace(0, 1, fade_len)
    envelope[-fade_len:] = np.linspace(1, 0, fade_len)
    wave = wave * envelope

    audio_data = np.int16(wave * 32767)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    wavfile.write(filepath, sample_rate, audio_data)


def init_sfx_library(sfx_dir="assets/sounds"):
    """
    Check for required sound effect files and generate any that are missing.

    Parameters:
        sfx_dir (str): Relative or absolute path to the sounds directory.
    """
    sounds = {
        f"{sfx_dir}/wake.wav": (440, 880, 0.25),
        f"{sfx_dir}/listening.wav": (600, 600, 0.15),
        f"{sfx_dir}/success.wav": (880, 1200, 0.35),
        f"{sfx_dir}/error.wav": (300, 150, 0.4),
    }
    for filepath, (f1, f2, dur) in sounds.items():
        if not os.path.exists(filepath):
            generate_beep(filepath, f1, f2, dur)