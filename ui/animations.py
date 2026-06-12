"""
Animations - Fade-in, fade-out, and geometry smoothing helpers for Jarvis HUD.

Provides utility functions for smooth transitions on Tkinter widgets.
"""
import math


def lerp(a, b, t):
    """Linear interpolation between a and b by factor t (0-1)."""
    return a + (b - a) * t


def smoothstep(t):
    """Smooth step function for easing transitions."""
    return t * t * (3 - 2 * t)


def ease_in_out(t):
    """Ease-in-out cubic function."""
    if t < 0.5:
        return 4 * t * t * t
    else:
        return 1 - (-2 * t + 2) ** 3 / 2


def fade_in(widget, steps=20, interval=10):
    """
    Animate a widget from transparent to fully visible.

    Parameters:
        widget: Tkinter widget with configure().
        steps (int): Number of animation steps.
        interval (int): Milliseconds between steps.
    """

    def _step(alpha=0.0):
        if alpha <= 1.0:
            try:
                widget.attributes("-alpha", alpha)
            except Exception:
                pass
            widget.after(interval, _step, alpha + 1.0 / steps)
        else:
            try:
                widget.attributes("-alpha", 1.0)
            except Exception:
                pass

    _step()


def fade_out(widget, steps=20, interval=10, on_complete=None):
    """
    Animate a widget from fully visible to transparent.

    Parameters:
        widget: Tkinter widget with configure().
        steps (int): Number of animation steps.
        interval (int): Milliseconds between steps.
        on_complete (callable): Optional callback when fade completes.
    """

    def _step(alpha=1.0):
        if alpha >= 0.0:
            try:
                widget.attributes("-alpha", alpha)
            except Exception:
                pass
            widget.after(interval, _step, alpha - 1.0 / steps)
        else:
            try:
                widget.attributes("-alpha", 0.0)
            except Exception:
                pass
            if on_complete:
                on_complete()

    _step()