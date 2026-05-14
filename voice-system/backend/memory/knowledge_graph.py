import networkx as nx
import json
import time
from pathlib import Path
from typing import Dict, Any, List
from core.logger import logger

GRAPH_FILE = Path(__file__).resolve().parent.parent / "data" / "knowledge_graph.json"
GRAPH_FILE.parent.mkdir(parents=True, exist_ok=True)

class KnowledgeGraph:
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.load()

    def add_entity(self, name: str, category: str, importance: float = 0.5):
        """Add or update a node in the graph."""
        if not self.graph.has_node(name):
            self.graph.add_node(name, category=category, importance=importance, mentions=1, last_seen=time.time())
            logger.info(f"🆕 Added entity to graph: {name} ({category})")
        else:
            data = self.graph.nodes[name]
            data["mentions"] += 1
            data["last_seen"] = time.time()
            data["importance"] = max(data["importance"], importance)
            logger.info(f"📈 Updated entity in graph: {name} (mentions: {data['mentions']})")

    def add_relationship(self, source: str, target: str, rel_type: str, weight: float = 1.0):
        """Add a directed relationship between two entities."""
        self.graph.add_edge(source, target, type=rel_type, weight=weight, timestamp=time.time())
        logger.info(f"🔗 Added relationship: {source} --[{rel_type}]--> {target}")

    def get_related(self, entity_name: str, depth: int = 1) -> List[Dict[str, Any]]:
        """Retrieve related entities and their relationship types."""
        if not self.graph.has_node(entity_name):
            return []
        
        related = []
        # Simple depth-1 traversal for now
        for target in self.graph.neighbors(entity_name):
            edge_data = self.graph.get_edge_data(entity_name, target)
            related.append({
                "entity": target,
                "category": self.graph.nodes[target].get("category"),
                "relationships": [e["type"] for e in edge_data.values()]
            })
        return related

    def save(self):
        """Persist the graph to JSON."""
        data = nx.node_link_data(self.graph)
        with open(GRAPH_FILE, "w") as f:
            json.dump(data, f, indent=2)
        logger.info(f"💾 Knowledge graph saved to {GRAPH_FILE}")

    def load(self):
        """Load the graph from JSON."""
        if GRAPH_FILE.exists():
            try:
                with open(GRAPH_FILE, "r") as f:
                    data = json.load(f)
                    self.graph = nx.node_link_graph(data)
                logger.info("✅ Knowledge graph loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load knowledge graph: {e}")
                self.graph = nx.MultiDiGraph()
        else:
            self.graph = nx.MultiDiGraph()

# Global instance
kg = KnowledgeGraph()
