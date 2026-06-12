"""
Odyssee HUD - Frameless CustomTkinter overlay for Jarvis.

Features a transparent, always-on-top window with an animated orb
and a scrollable terminal-style text feed for displaying system status.
"""
import customtkinter as ctk
from ui.orb_widget import JarvisOrb


class OdysseeHUD(ctk.CTk):
    """
    Main HUD window for the Jarvis desktop overlay.

    Layout:
        - JarvisOrb (animated state indicator)
        - CTkTextbox (scrollable log / status feed)
    """

    def __init__(self):
        super().__init__()

        # Configure frameless window, always on top
        self.overrideredirect(True)
        self.attributes("-topmost", True)
        self.geometry("450x700+50+50")

        # Windows color-key transparency (black = transparent)
        self.configure(bg="black")
        try:
            self.attributes("-transparentcolor", "black")
        except Exception:
            pass  # Fallback for non-Windows platforms

        # Set dark theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")

        # Main container frame
        self.container = ctk.CTkFrame(self, fg_color="#0a0a0a", corner_radius=12)
        self.container.pack(fill="both", expand=True, padx=4, pady=4)

        # Animated orb widget
        self.orb = JarvisOrb(self.container, size=180)
        self.orb.pack(pady=20)

        # Scrollable text terminal
        self.terminal = ctk.CTkTextbox(
            self.container,
            width=400,
            height=400,
            fg_color="#0d1117",
            text_color="#58a6ff",
            font=("Courier", 12),
            wrap="word",
        )
        self.terminal.pack(padx=20, pady=(0, 20), fill="both", expand=True)
        self.terminal.insert("insert", "SYSTEM ONLINE. AWAITING SUMMONS (Ctrl+J)\n")
        self.terminal.configure(state="disabled")

        # Drag handle for moving the frameless window
        self.title_bar = ctk.CTkLabel(
            self.container,
            text="  JARVIS HUD  ",
            font=("Courier", 14, "bold"),
            text_color="#00f3ff",
            fg_color="#0d1117",
            corner_radius=6,
        )
        self.title_bar.pack(pady=(8, 0), padx=20, fill="x")
        self.title_bar.bind("<Button-1>", self._start_move)
        self.title_bar.bind("<B1-Motion>", self._on_move)

        # Bind close hotkey
        self.bind("<Escape>", lambda e: self.quit())

    def _start_move(self, event):
        """Record the initial position for window dragging."""
        self._x = event.x
        self._y = event.y

    def _on_move(self, event):
        """Handle window dragging."""
        deltax = event.x - self._x
        deltay = event.y - self._y
        x = self.winfo_x() + deltax
        y = self.winfo_y() + deltay
        self.geometry(f"+{x}+{y}")

    def log(self, text):
        """
        Append a line to the terminal feed.

        Parameters:
            text (str): Text to display.
        """
        self.terminal.configure(state="normal")
        self.terminal.insert("insert", f"> {text}\n")
        self.terminal.see("end")
        self.terminal.configure(state="disabled")