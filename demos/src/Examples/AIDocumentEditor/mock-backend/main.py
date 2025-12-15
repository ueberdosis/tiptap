"""
Mock FastAPI Backend for AI Document Editor

This provides a development server for testing AI features.
In production, this would be replaced by ScyAI's reasoning engine.

Run with: uvicorn main:app --reload --port 8000
"""

import asyncio
import json
import random
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(
    title="AI Document Editor - Mock Backend",
    description="Mock AI backend for development and testing",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request models
class EditRequest(BaseModel):
    action: str
    text: str
    context: Optional[str] = None
    custom_prompt: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class DocumentContext(BaseModel):
    currentSelection: Optional[dict] = None
    documentOutline: Optional[list] = None
    currentSection: Optional[dict] = None


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    document_context: Optional[DocumentContext] = None


# Mock response generators
IMPROVEMENT_PATTERNS = {
    "very": "exceptionally",
    "good": "excellent",
    "bad": "suboptimal",
    "big": "substantial",
    "small": "minimal",
    "important": "crucial",
    "nice": "remarkable",
    "show": "demonstrate",
    "use": "utilize",
    "get": "obtain",
    "make": "create",
    "help": "assist",
}

SIMPLIFICATION_PATTERNS = {
    "utilize": "use",
    "implement": "do",
    "subsequently": "then",
    "nevertheless": "but",
    "furthermore": "also",
    "facilitate": "help",
    "commence": "start",
    "terminate": "end",
    "endeavor": "try",
    "ascertain": "find out",
}


def improve_text(text: str) -> str:
    """Improve the quality of text by replacing common words with better alternatives."""
    result = text
    for old, new in IMPROVEMENT_PATTERNS.items():
        result = result.replace(old, new)
        result = result.replace(old.capitalize(), new.capitalize())
    # Ensure proper ending
    result = result.strip()
    if result and not result[-1] in ".!?":
        result += "."
    return result


def simplify_text(text: str) -> str:
    """Simplify text by replacing complex words with simpler alternatives."""
    result = text
    for old, new in SIMPLIFICATION_PATTERNS.items():
        result = result.replace(old, new)
        result = result.replace(old.capitalize(), new.capitalize())
    return result


def expand_text(text: str) -> str:
    """Expand text with additional context and elaboration."""
    expansions = [
        f"{text} This point warrants further elaboration.",
        "Specifically, we should consider the broader implications and context.",
        "Additionally, there are several related factors that merit attention in this discussion.",
        "It is worth noting that this aspect plays a crucial role in the overall framework.",
    ]
    return " ".join(expansions)


def summarize_text(text: str) -> str:
    """Summarize text to its key points."""
    sentences = [s.strip() for s in text.split(".") if s.strip()]
    if len(sentences) <= 1:
        return text
    return sentences[0] + "."


def fix_grammar(text: str) -> str:
    """Fix grammar and formatting issues."""
    import re

    # Remove extra whitespace
    result = " ".join(text.split())
    # Fix punctuation spacing
    result = re.sub(r"\s+([.,!?])", r"\1", result)
    # Capitalize after sentence endings
    result = re.sub(r"([.!?])\s+([a-z])", lambda m: f"{m.group(1)} {m.group(2).upper()}", result)
    # Ensure first letter is capitalized
    if result:
        result = result[0].upper() + result[1:]
    return result


def make_formal(text: str) -> str:
    """Make text more formal."""
    contractions = {
        "can't": "cannot",
        "won't": "will not",
        "don't": "do not",
        "it's": "it is",
        "I'm": "I am",
        "you're": "you are",
        "we're": "we are",
        "they're": "they are",
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not",
        "haven't": "have not",
        "hasn't": "has not",
        "hadn't": "had not",
    }
    result = text
    for contraction, full in contractions.items():
        result = result.replace(contraction, full)
        result = result.replace(contraction.capitalize(), full.capitalize())
    return result


def make_casual(text: str) -> str:
    """Make text more casual."""
    formal_to_casual = {
        "cannot": "can't",
        "will not": "won't",
        "do not": "don't",
        "it is": "it's",
        "I am": "I'm",
        "you are": "you're",
        "we are": "we're",
        "they are": "they're",
    }
    result = text
    for formal, casual in formal_to_casual.items():
        result = result.replace(formal, casual)
        result = result.replace(formal.capitalize(), casual.capitalize())
    return result


def process_action(action: str, text: str, custom_prompt: Optional[str] = None) -> str:
    """Process the text based on the specified action."""
    actions = {
        "improve": improve_text,
        "simplify": simplify_text,
        "expand": expand_text,
        "summarize": summarize_text,
        "fix-grammar": fix_grammar,
        "formal": make_formal,
        "casual": make_casual,
    }

    if action == "custom" and custom_prompt:
        return f"[Applied: {custom_prompt}] {text}"
    elif action == "translate":
        return f"[Translated] {text}"

    processor = actions.get(action)
    if processor:
        return processor(text)
    return text


def generate_chat_response(messages: list[ChatMessage], context: Optional[DocumentContext]) -> str:
    """Generate a chat response based on messages and document context."""
    last_message = messages[-1].content.lower() if messages else ""

    # Check for document context
    if context and context.currentSelection:
        selection_text = context.currentSelection.get("text", "")[:100]
        if "improve" in last_message or "better" in last_message:
            return f"""I can help improve the selected text: "{selection_text}..."

Here's a suggested revision that enhances clarity and impact while maintaining your original intent. The key changes focus on:

1. **Stronger word choices** - Replacing weak modifiers with more precise language
2. **Better flow** - Restructuring for improved readability
3. **Clearer meaning** - Ensuring the message is unambiguous

Would you like me to apply this change to your document?"""

        if "explain" in last_message or "what" in last_message:
            return f"""The selected passage discusses an important concept. Let me break it down:

**Selected text:** "{selection_text}..."

**Analysis:**
1. **Key Point**: The main idea centers on establishing a clear framework
2. **Context**: This relates to the broader document theme
3. **Implications**: This suggests specific actions or considerations

Would you like me to elaborate on any of these points?"""

    # General responses
    if "help" in last_message or "how" in last_message:
        return """I'm here to help you with your document! I can:

- **Edit text**: Select text and use the AI menu to improve, simplify, or expand it
- **Answer questions**: Ask me about your document content or structure
- **Make suggestions**: Request specific changes to sections or paragraphs
- **Review content**: Provide feedback on clarity, tone, or completeness

What would you like me to help with?"""

    if "section" in last_message or "outline" in last_message:
        if context and context.documentOutline:
            sections = [f"{i+1}. {s.get('title', 'Untitled')}" for i, s in enumerate(context.documentOutline)]
            return f"""Your document has {len(sections)} sections:

{chr(10).join(sections)}

Which section would you like to work on? I can help you:
- Improve the content
- Expand on specific points
- Reorganize the structure
- Check for completeness"""

        return """I can help you structure your document into sections. Would you like me to:

1. Analyze your current content and suggest headings?
2. Help you outline a new structure?
3. Review and improve existing section organization?

What approach works best for you?"""

    if "summary" in last_message or "summarize" in last_message:
        return """I'd be happy to summarize your document. Here's what I can see:

**Document Overview:**
- Multiple sections covering key topics
- Mix of explanatory content and actionable items
- Clear structure with logical flow

**Main Themes:**
1. Core concepts and definitions
2. Practical applications
3. Implementation guidance

Would you like a more detailed summary of any specific section?"""

    # Default response
    return """I understand you're working on this document. How can I assist you?

I can help with:
- **Improving specific sections** - Select text and ask me to enhance it
- **Answering questions** - Ask about content, structure, or style
- **Making changes** - Describe what you'd like to modify

Just select some text or describe what you'd like to change, and I'll help you make it better!"""


async def stream_text(text: str, delay_range: tuple = (0.02, 0.05)):
    """Stream text word by word with realistic delays."""
    words = text.split(" ")
    for i, word in enumerate(words):
        await asyncio.sleep(random.uniform(*delay_range))
        chunk = word + (" " if i < len(words) - 1 else "")
        yield f"data: {chunk}\n\n"
    yield "data: [DONE]\n\n"


@app.get("/")
async def root():
    """Root endpoint."""
    return {"status": "ok", "message": "AI Document Editor Mock Backend"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "0.1.0"}


@app.post("/api/ai/edit")
async def ai_edit(request: EditRequest):
    """
    Process an AI edit request and stream the response.

    Supports actions: improve, simplify, expand, summarize, fix-grammar, formal, casual, translate, custom
    """
    try:
        response = process_action(request.action, request.text, request.custom_prompt)
        return StreamingResponse(
            stream_text(response),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/chat")
async def ai_chat(request: ChatRequest):
    """
    Process a chat request and stream the response.

    Takes conversation history and optional document context.
    """
    try:
        response = generate_chat_response(request.messages, request.document_context)
        return StreamingResponse(
            stream_text(response, delay_range=(0.01, 0.03)),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
