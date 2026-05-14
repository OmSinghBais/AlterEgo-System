from typing import Dict, Any, List
from memory.knowledge_graph import kg
from core.logger import logger

def assemble_context(query: str, active_entities: List[str] = None) -> str:
    """
    Assembles a rich context string for the LLM by combining:
    1. Direct facts about the user.
    2. Semantic memories (RAG).
    3. Graph-based entity relationships.
    """
    from memory import get_all_facts, search_memory
    
    context_lines = []
    
    # 1. Facts
    facts = get_all_facts()
    if facts:
        context_lines.append("[CORE FACTS]")
        for k, v in list(facts.items())[:10]:
            context_lines.append(f"- {k}: {v}")

    # 2. Semantic Search (RAG)
    semantic = search_memory(query, limit=3)
    if semantic:
        context_lines.append("\n[PAST INSIGHTS]")
        for s in semantic:
            context_lines.append(f"- {s}")

    # 3. Graph Relationships
    # If we have active entities in the current query, pull their neighbors
    if active_entities:
        context_lines.append("\n[KNOWLEDGE GRAPH]")
        for entity in active_entities:
            related = kg.get_related(entity)
            if related:
                for r in related:
                    rels = ", ".join(r["relationships"])
                    context_lines.append(f"- {entity} --({rels})--> {r['entity']} ({r['category']})")

    return "\n".join(context_lines)
