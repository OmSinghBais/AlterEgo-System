import os
from neo4j import GraphDatabase
from config.settings import get_settings
from utils.logger import logger

settings = get_settings()

class KnowledgeGraph:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None

    def connect(self):
        if not self.driver:
            try:
                self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
                self.driver.verify_connectivity()
                logger.info("🕸️ Connected to Neo4j Knowledge Graph.")
            except Exception as e:
                logger.warning(f"Neo4j connection failed: {e}. Graph memory disabled.")
                self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def add_relationship(self, entity1: str, relationship: str, entity2: str, category: str = "generic"):
        """Store a relationship: (Entity1)-[Relationship]->(Entity2)"""
        self.connect()
        if not self.driver: return

        query = (
            "MERGE (e1:Entity {name: $e1_name}) "
            "MERGE (e2:Entity {name: $e2_name}) "
            "SET e1.category = $cat "
            "MERGE (e1)-[r:RELATED {type: $rel}]->(e2) "
            "RETURN r"
        )
        with self.driver.session() as session:
            session.run(query, e1_name=entity1, e2_name=entity2, rel=relationship, cat=category)

    def get_related(self, entity_name: str) -> list:
        """Fetch all related entities for a given entity."""
        self.connect()
        if not self.driver: return []

        query = (
            "MATCH (e1:Entity {name: $name})-[r:RELATED]->(e2:Entity) "
            "RETURN e2.name as related_entity, r.type as relationship, e2.category as category"
        )
        with self.driver.session() as session:
            results = session.run(query, name=entity_name)
            return [dict(record) for record in results]

    def get_all_entities(self) -> list:
        """Fetch all entity names."""
        self.connect()
        if not self.driver: return []

        query = "MATCH (e:Entity) RETURN e.name as name"
        with self.driver.session() as session:
            results = session.run(query)
            return [record["name"] for record in results]

kg = KnowledgeGraph()
