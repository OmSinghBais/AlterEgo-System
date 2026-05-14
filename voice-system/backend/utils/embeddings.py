"""
AlterEGO — Embedding Utility
Uses sentence-transformers for local, privacy-preserving semantic vectors.
"""

import numpy as np
from typing import List
from utils.logger import logger

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading embedding model (all-MiniLM-L6-v2)...")
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Embedding model loaded.")
        except ImportError:
            logger.error("sentence-transformers not installed. Semantic memory will be disabled.")
            return None
    return _model

def get_embedding(text: str) -> List[float]:
    """Generate a vector for the given text."""
    model = get_embedding_model()
    if model is None:
        return []
    
    embedding = model.encode(text)
    return embedding.tolist()

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    if not v1 or not v2:
        return 0.0
    
    a = np.array(v1)
    b = np.array(v2)
    
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return float(dot_product / (norm_a * norm_b))
