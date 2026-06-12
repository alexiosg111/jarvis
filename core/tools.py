"""
Jarvis Tools - Local command execution and PyAutoGUI automation.

Provides a suite of tools that the LangGraph orchestrator can invoke
for desktop automation and system interaction.
"""
import subprocess
import pyautogui


class JarvisTools:
    """Collection of executable actions for the Jarvis agent."""

    @staticmethod
    def execute_terminal_command(command):
        """
        Execute a shell command and return its output.

        Parameters:
            command (str): Shell command to run.

        Returns:
            str: Combined stdout and stderr output.
        """
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=15,
            )
            output = ""
            if result.stdout:
                output += f"STDOUT:\n{result.stdout}\n"
            if result.stderr:
                output += f"STDERR:\n{result.stderr}\n"
            return output.strip() or "(no output)"
        except subprocess.TimeoutExpired:
            return "Error: Command timed out after 15 seconds."
        except Exception as e:
            return f"Error executing command: {str(e)}"

    @staticmethod
    def mouse_click(x, y):
        """
        Click at the specified screen coordinates.

        Parameters:
            x (int): X coordinate.
            y (int): Y coordinate.

        Returns:
            str: Confirmation message.
        """
        pyautogui.click(x, y)
        return f"Clicked position ({x}, {y})"

    @staticmethod
    def type_text(text):
        """
        Type the given text at the current cursor position.

        Parameters:
            text (str): Text to type.

        Returns:
            str: Confirmation message.
        """
        pyautogui.typewrite(text)
        return f"Typed text ({len(text)} characters)"

    @staticmethod
    def press_key(key):
        """
        Press a keyboard key.

        Parameters:
            key (str): Key name (e.g., 'enter', 'tab', 'escape').

        Returns:
            str: Confirmation message.
        """
        pyautogui.press(key)
        return f"Pressed key: {key}"

    @staticmethod
    def get_screen_size():
        """
        Return the screen resolution.

        Returns:
            str: Screen dimensions.
        """
        w, h = pyautogui.size()
        return f"Screen size: {w}x{h}"