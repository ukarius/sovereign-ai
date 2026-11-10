"""
Sovereign OS — Pydantic Schemas (Request/Response models)
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "CREATOR" or "BRAND"
    niche: Optional[str] = None
    industry: Optional[str] = None


class TokenResponse(BaseModel):
    """Matches existing frontend contract: { token, userId, name, email, role }"""
    token: str
    userId: int
    name: str
    email: str
    role: str


class CreatorMatchResult(BaseModel):
    """Result returned by the matching engine for creator→brand matches."""
    brand_id: int
    brand_name: str
    industry: str
    match_score: float  # 0.0 to 1.0
    match_reason: str   # human-readable explanation
    budget_range: str   # "$15k–$150k"


class BrandMatchResult(BaseModel):
    """Result returned by the matching engine for brand→creator matches."""
    creator_id: int
    creator_name: str
    handle: str
    niche: str
    follower_count: int
    engagement_rate: float
    match_score: float
    match_reason: str


class CreatorPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    """Public creator profile for API responses."""
    id: int
    name: str
    handle: str
    niche: str
    follower_count: int
    engagement_rate: float
    platforms: str
    bio: str
    location: str
    avg_video_views: int
    is_vip: bool


class BrandPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    """Public brand profile for API responses."""
    id: int
    name: str
    industry: str
    target_niches: str
    budget_min: int
    budget_max: int
    description: str
    headquarters: str
    preferred_platforms: str
    is_vip: bool
