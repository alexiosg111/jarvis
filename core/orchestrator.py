"""
Orchestrator - LangGraph state-graph brain for Jarvis HUD.

Defines the AgentState schema, graph nodes (memory, routing, LLM, tools),
and conditional edges that drive Jarvis's reactive workflow loop.
"""
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END

from core.llm_client import DualGPURouter
from core.memory import MemoryEngine
from core.tools import JarvisTools
from core.vision import VisionCapture


class AgentState(TypedDict):
    """State schema for the LangGraph orchestrator."""

    user_query: str
    screenshot: Optional[str]
    retrieved_memory: str
    tool_command: Optional[str]
    tool_output: Optional[str]
    agent_response: str
    next_step: str


class JarvisOrchestrator:
    """
    Manages the LangGraph state machine that controls Jarvis's reasoning loop.

    Node flow:
        memory_lookup -> router -> llm -> (tools -> llm | END)
    """

    def __init__(self):
        self.llm = DualGPURouter()
        self.memory = MemoryEngine()
        self.tools = JarvisTools()
        self.vision = VisionCapture()
        self.graph = self._build_graph()

    def _memory_lookup_node(self, state: AgentState) -> AgentState:
        """Retrieve relevant context from Qdrant vector memory."""
        query = state.get("user_query", "")
        if query:
            state["retrieved_memory"] = self.memory.retrieve_context(query)
        else:
            state["retrieved_memory"] = ""
        return state

    def _routing_node(self, state: AgentState) -> AgentState:
        """
        Determine whether the query requires vision analysis.
        If a tool was just executed, route back to llm for final response.
        """
        if state.get("tool_output"):
            state["next_step"] = "llm"
            return state

        query = state.get("user_query", "").lower()
        vision_keywords = [
            "screen", "see", "look", "view", "display", "screenshot",
            "what is on", "show", "image", "picture", "ui", "interface",
        ]
        if any(kw in query for kw in vision_keywords):
            state["screenshot"] = self.vision.capture_screen_base64()
            state["next_step"] = "vision_llm"
        else:
            state["screenshot"] = None
            state["next_step"] = "text_llm"
        return state

    def _llm_node(self, state: AgentState) -> AgentState:
        """Execute the LLM call with appropriate model and context."""
        system_prompt = (
            "You are Jarvis, an advanced desktop assistant. "
            "You can execute terminal commands and control the desktop. "
            "Be concise and helpful. When you need to run a tool, "
            "respond with a JSON action like: "
            '{"tool": "execute_terminal_command", "args": {"command": "ls"}}'
        )

        if state.get("next_step") == "vision_llm" and state.get("screenshot"):
            response = self.llm.query_vision_model(
                state["user_query"], state["screenshot"]
            )
        else:
            response = self.llm.query_with_context(
                state["user_query"],
                system_prompt,
                state.get("retrieved_memory", ""),
            )

        state["agent_response"] = response

        # Parse tool call from response
        if '{"tool":' in response:
            import json

            try:
                tool_call = json.loads(
                    response[response.index('{"tool"') : response.index("}") + 1]
                )
                state["tool_command"] = tool_call["tool"]
                state["next_step"] = "tools"
            except (json.JSONDecodeError, KeyError, ValueError):
                state["tool_command"] = None
                state["next_step"] = "generate_response"
        else:
            state["tool_command"] = None
            state["next_step"] = "generate_response"

        return state

    def _tools_node(self, state: AgentState) -> AgentState:
        """Execute the requested tool command."""
        tool_name = state.get("tool_command")
        if tool_name == "execute_terminal_command":
            # Re-prompt the LLM to get the actual command
            state["tool_output"] = self.tools.execute_terminal_command(
                state.get("user_query", "")
            )
        elif tool_name == "mouse_click":
            import re

            coords = re.findall(r"\d+", state.get("user_query", ""))
            if len(coords) >= 2:
                state["tool_output"] = self.tools.mouse_click(
                    int(coords[0]), int(coords[1])
                )
            else:
                state["tool_output"] = "Error: No coordinates found in query."
        else:
            state["tool_output"] = f"Tool '{tool_name}' not recognized."

        # Store the result in memory
        if state.get("tool_output"):
            self.memory.store_memory(
                f"Tool result: {state['tool_output']}"
            )

        state["next_step"] = "generate_response"
        return state

    def _build_graph(self):
        """Construct the LangGraph StateGraph with nodes and edges."""
        workflow = StateGraph(AgentState)

        workflow.add_node("memory_lookup", self._memory_lookup_node)
        workflow.add_node("router", self._routing_node)
        workflow.add_node("llm", self._llm_node)
        workflow.add_node("tools", self._tools_node)

        workflow.set_entry_point("memory_lookup")

        workflow.add_edge("memory_lookup", "router")
        workflow.add_edge("router", "llm")

        workflow.add_conditional_edges(
            "llm",
            lambda state: state["next_step"],
            {
                "tools": "tools",
                "generate_response": END,
                "text_llm": END,
                "vision_llm": END,
            },
        )
        workflow.add_edge("tools", END)

        return workflow.compile()

    def process_query(self, user_query):
        """
        Process a user query through the LangGraph orchestrator.

        Parameters:
            user_query (str): The transcribed user input.

        Returns:
            str: The final agent response.
        """
        initial_state: AgentState = {
            "user_query": user_query,
            "screenshot": None,
            "retrieved_memory": "",
            "tool_command": None,
            "tool_output": None,
            "agent_response": "",
            "next_step": "",
        }

        result = self.graph.invoke(initial_state)
        return result.get("agent_response", "I'm sorry, I couldn't process that.")