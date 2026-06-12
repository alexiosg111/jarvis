"""
Jarvis Orb Widget - Animated Canvas-based circular reactor for Jarvis HUD.

Draws geometric arcs, concentric pulses, and orbital rotating rings
that change rendering patterns based on Jarvis's current state:
    idle, listening, thinking, speaking, executing
"""
import math
import tkinter as tk


class JarvisOrb(tk.Canvas):
    """
    Animated circular orb widget that visually represents Jarvis's state.

    The orb renders different geometric patterns depending on the
    current operational state of the assistant.
    """

    def __init__(self, parent, size=150, **kwargs):
        super().__init__(
            parent,
            width=size,
            height=size,
            bg="black",
            highlightthickness=0,
            **kwargs,
        )
        self.size = size
        self.center = size // 2
        self.state = "idle"
        self.angle = 0
        self.pulse = 0
        self.animate()

    def set_state(self, state):
        """
        Update the visual state of the orb.

        Parameters:
            state (str): One of 'idle', 'listening', 'thinking',
                         'speaking', 'executing'.
        """
        if state in ("idle", "listening", "thinking", "speaking", "executing"):
            self.state = state

    def animate(self):
        """Main animation loop - redraws the orb every 30ms."""
        self.delete("all")
        self.angle = (self.angle + 5) % 360
        self.pulse = (self.pulse + 0.1) % (2 * math.pi)

        radius_base = self.size * 0.35
        pulse_val = math.sin(self.pulse) * 5

        if self.state == "idle":
            self._draw_idle(radius_base, pulse_val)
        elif self.state == "listening":
            self._draw_listening(radius_base, pulse_val)
        elif self.state == "thinking":
            self._draw_thinking(radius_base)
        elif self.state == "speaking":
            self._draw_speaking(radius_base)
        elif self.state == "executing":
            self._draw_executing(radius_base)

        self.after(30, self.animate)

    def _draw_idle(self, radius_base, pulse_val):
        """Slow breathing blue circle - awaiting activation."""
        r = radius_base + pulse_val
        self.create_oval(
            self.center - r,
            self.center - r,
            self.center + r,
            self.center + r,
            outline="#00f3ff",
            width=3,
        )
        self.create_oval(
            self.center - r + 8,
            self.center - r + 8,
            self.center + r - 8,
            self.center + r - 8,
            outline="#005e63",
            width=1,
        )

    def _draw_listening(self, radius_base, pulse_val):
        """Expanding pulsing green concentric rings - actively listening."""
        r = radius_base + (pulse_val * 1.5)
        self.create_oval(
            self.center - r,
            self.center - r,
            self.center + r,
            self.center + r,
            outline="#39ff14",
            width=4,
        )
        self.create_oval(
            self.center - r * 0.6,
            self.center - r * 0.6,
            self.center + r * 0.6,
            self.center + r * 0.6,
            outline="#00ff88",
            width=2,
        )

    def _draw_thinking(self, radius_base):
        """Rotating segmented arcs (purple/magenta) - processing."""
        r = radius_base
        self.create_arc(
            self.center - r,
            self.center - r,
            self.center + r,
            self.center + r,
            start=self.angle,
            extent=90,
            outline="#ff007f",
            width=4,
            style="arc",
        )
        self.create_arc(
            self.center - r,
            self.center - r,
            self.center + r,
            self.center + r,
            start=self.angle + 180,
            extent=90,
            outline="#bc13fe",
            width=4,
            style="arc",
        )
        self.create_oval(
            self.center - r * 0.4,
            self.center - r * 0.4,
            self.center + r * 0.4,
            self.center + r * 0.4,
            fill="#120024",
            outline="#ff007f",
        )

    def _draw_speaking(self, radius_base):
        """Yellow wave amplitude rings - speaking."""
        r1 = radius_base + math.sin(self.pulse * 2) * 8
        r2 = radius_base - math.sin(self.pulse * 2) * 4
        self.create_oval(
            self.center - r1,
            self.center - r1,
            self.center + r1,
            self.center + r1,
            outline="#ffd700",
            width=3,
        )
        self.create_oval(
            self.center - r2,
            self.center - r2,
            self.center + r2,
            self.center + r2,
            outline="#ffa500",
            width=1,
        )

    def _draw_executing(self, radius_base):
        """Fast warning orange orbital nodes - executing an action."""
        r = radius_base
        self.create_oval(
            self.center - r,
            self.center - r,
            self.center + r,
            self.center + r,
            outline="#ff4500",
            width=2,
            dash=(4, 4),
        )
        dot_x = self.center + r * math.cos(math.radians(self.angle))
        dot_y = self.center + r * math.sin(math.radians(self.angle))
        self.create_oval(
            dot_x - 6, dot_y - 6, dot_x + 6, dot_y + 6, fill="#ff8c00", outline=""
        )