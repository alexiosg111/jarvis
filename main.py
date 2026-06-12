#!/usr/bin/env python3
"""
Jarvis Desktop HUD - Application Launcher

Bootstraps the Odyssey HUD overlay, initializes audio IO,
registers global hotkeys, and coordinates the LangGraph orchestrator
in background threads.
"""
import threading
import sys
import os

# Ensure the project root is on the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ui.hud import OdysseeHUD
from utils.audio_io import AudioIO
from utils.sfx_generator import init_sfx_library
from core.orchestrator import JarvisOrchestrator
from pynput import keyboard


class JarvisApp:
    """
    Main application controller for Jarvis Desktop HUD.

    Manages the lifecycle of the HUD, audio system, orchestrator,
    and global hotkey registration.
    """

    def __init__(self):
        # Ensure sound effects exist
        init_sfx_library()

        self.hud = OdysseeHUD()
        self.audio = AudioIO()
        self.orchestrator = JarvisOrchestrator()
        self.is_recording = False

        # Register global hotkey: Ctrl+J to activate
        self.listener = keyboard.GlobalHotKeys({"<ctrl>+j": self.toggle_session})
        self.listener.start()

        self.hud.log("Jarvis HUD initialized. Press Ctrl+J to activate.")

    def toggle_session(self):
        """Toggle between idle and listening states."""
        if not self.is_recording:
            threading.Thread(target=self.run_listening_session, daemon=True).start()

    def run_listening_session(self):
        """Execute a full listen-think-speak cycle in a background thread."""
        self.is_recording = True
        try:
            # Update UI from background thread via after()
            self._set_orb_state("listening")
            self._hud_log("Jarvis Listening...")
            self.audio.play_sfx("wake")

            # Record microphone
            audio_file = self.audio.record_microphone()

            # Transcribe
            self._set_orb_state("thinking")
            self._hud_log("Processing Speech...")
            user_query = self.audio.transcribe_audio(audio_file)
            self._hud_log(f"User Query: {user_query}")

            if user_query:
                # Run through LangGraph orchestrator
                self._set_orb_state("executing")
                self._hud_log("Consulting knowledge graph...")

                response = self.orchestrator.process_query(user_query)

                self._set_orb_state("speaking")
                self._hud_log(f"Jarvis: {response}")

                # Speak the response
                self.audio.speak(response)
                self.audio.play_sfx("success")
            else:
                self.audio.play_sfx("error")
                self._hud_log("No audio signal captured.")

        except Exception as e:
            self._hud_log(f"Error: {str(e)}")
            self.audio.play_sfx("error")
        finally:
            self._set_orb_state("idle")
            self.is_recording = False

    def _set_orb_state(self, state):
        """Thread-safe orb state update via Tkinter's after()."""
        self.hud.after(0, self.hud.orb.set_state, state)

    def _hud_log(self, text):
        """Thread-safe HUD log update via Tkinter's after()."""
        self.hud.after(0, self.hud.log, text)

    def run(self):
        """Start the HUD application main loop."""
        try:
            self.hud.mainloop()
        except KeyboardInterrupt:
            pass
        finally:
            self.listener.stop()
            self.hud.quit()


if __name__ == "__main__":
    app = JarvisApp()
    app.run()