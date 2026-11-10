"""
Sovereign OS — ML Matchmaker Engine
TF-IDF + Cosine Similarity for brand↔creator matching.
KNN for peer analytics.
Now backed by SQLModel objects instead of in-memory dicts.
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors

from models import Creator, Brand
from schemas import CreatorMatchResult, BrandMatchResult

# Module-level vectorizer cache for performance
_vectorizer_cache: dict = {}


def compute_tfidf_creator_matches(
    creator: Creator,
    all_brands: list[Brand],
    top_k: int = 10,
) -> list[CreatorMatchResult]:
    """
    Uses TF-IDF + Cosine Similarity to find top brand matches for a creator.
    Returns a list of CreatorMatchResult schemas.
    """
    if not all_brands:
        return []

    # Build text documents
    creator_doc = f"{creator.niche} {creator.sub_niche} {creator.bio} {creator.platforms}"

    brand_docs = [
        f"{b.industry} {b.sub_industry} {b.description} {b.target_niches}"
        for b in all_brands
    ]

    # Vectorize
    corpus = [creator_doc] + brand_docs
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    creator_vector = tfidf_matrix[0:1]
    brand_vectors = tfidf_matrix[1:]

    # Score
    similarities = cosine_similarity(creator_vector, brand_vectors)[0]
    top_indices = similarities.argsort()[-top_k:][::-1]

    results = []
    for idx in top_indices:
        brand = all_brands[idx]
        score = float(similarities[idx])
        results.append(CreatorMatchResult(
            brand_id=brand.id,
            brand_name=brand.name,
            industry=brand.industry,
            match_score=round(score, 4),
            match_reason=f"Your {creator.niche} content aligns with {brand.name}'s target audience in the {brand.industry} space.",
            budget_range=f"${brand.budget_min // 1000}k–${brand.budget_max // 1000}k",
        ))

    return results


def compute_tfidf_brand_matches(
    brand: Brand,
    all_creators: list[Creator],
    top_k: int = 10,
) -> list[BrandMatchResult]:
    """
    Uses TF-IDF + Cosine Similarity to find top creator matches for a brand.
    Returns a list of BrandMatchResult schemas.
    """
    if not all_creators:
        return []

    # Build text documents
    brand_doc = f"{brand.industry} {brand.sub_industry} {brand.description} {brand.target_niches}"

    creator_docs = [
        f"{c.niche} {c.sub_niche} {c.bio} {c.platforms}"
        for c in all_creators
    ]

    # Vectorize
    corpus = [brand_doc] + creator_docs
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    brand_vector = tfidf_matrix[0:1]
    creator_vectors = tfidf_matrix[1:]

    # Score
    similarities = cosine_similarity(brand_vector, creator_vectors)[0]
    top_indices = similarities.argsort()[-top_k:][::-1]

    results = []
    for idx in top_indices:
        creator = all_creators[idx]
        score = float(similarities[idx])
        results.append(BrandMatchResult(
            creator_id=creator.id,
            creator_name=creator.name,
            handle=creator.handle,
            niche=creator.niche,
            follower_count=creator.follower_count,
            engagement_rate=creator.engagement_rate,
            match_score=round(score, 4),
            match_reason=f"{creator.name}'s {creator.niche} audience aligns with {brand.name}'s target demographics in {brand.industry}.",
        ))

    return results


def get_similar_creators(
    target_creator: Creator,
    all_creators: list[Creator],
    k: int = 4,
) -> list[dict]:
    """
    Uses KNN to find similar creators based on follower count and engagement rate.
    Returns a list of creator dicts.
    """
    if not all_creators or len(all_creators) < 2:
        return []

    # Find the target index
    target_idx = None
    for i, c in enumerate(all_creators):
        if c.id == target_creator.id:
            target_idx = i
            break

    if target_idx is None:
        return []

    # Feature extraction
    features = np.array([
        [c.follower_count, c.engagement_rate]
        for c in all_creators
    ])

    # Normalize
    scaler = MinMaxScaler()
    normalized = scaler.fit_transform(features)

    # KNN
    n_neighbors = min(k + 1, len(all_creators))
    knn = NearestNeighbors(n_neighbors=n_neighbors, algorithm='ball_tree')
    knn.fit(normalized)

    target_features = normalized[target_idx].reshape(1, -1)
    distances, indices = knn.kneighbors(target_features)

    # Skip the first result (itself)
    similar = []
    for idx in indices[0][1:]:
        c = all_creators[idx]
        similar.append({
            "id": c.id,
            "name": c.name,
            "niche": c.niche,
            "follower_count": c.follower_count,
            "engagement_rate": c.engagement_rate,
        })

    return similar
