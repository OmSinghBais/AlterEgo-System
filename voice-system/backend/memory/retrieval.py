from typing import Dict, Any, List
from memory.knowledge_graph import kg
from core.logger import logger

def assemble_context(query: str, active_entities: List[str] = None) -> str:
    """
    Assembles a rich context string for the LLM by combining facts, RAG, and Graph.
    Performance optimized to avoid LLM pre-passes.
    """
    from memory import get_all_facts, search_memory
    
    context_lines = []
    
    # 1. Facts (Fast)
    facts = get_all_facts()
    if facts:
        context_lines.append("[CORE FACTS]")
        for k, v in list(facts.items())[:10]:
            context_lines.append(f"- {k}: {v}")

    # 2. Semantic Search (Fast local vectors)
    semantic = search_memory(query, limit=3)
    if semantic:
        context_lines.append("\n[PAST INSIGHTS]")
        for s in semantic:
            context_lines.append(f"- {s}")

    # 3. Graph Relationships (Keyword based, no LLM needed)
    # Heuristic: Find words in query that exist in the graph
    potential_entities = set(query.lower().split())
    graph_entities = kg.get_all_entities()
    matches = [e for e in graph_entities if e.lower() in potential_entities]
    
    # Also add explicitly passed entities
    if active_entities:
        matches.extend(active_entities)
    
    if matches:
        context_lines.append("\n[KNOWLEDGE GRAPH]")
        for entity in list(set(matches))[:5]:
            related = kg.get_related(entity)
            if related:
                for r in related:
                    rels = ", ".join(r["relationships"])
                    context_lines.append(f"- {entity} --({rels})--> {r['entity']} ({r['category']})")

    return "\n".join(context_lines)
