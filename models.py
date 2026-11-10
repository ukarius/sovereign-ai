"""
Sovereign OS — SQLModel Database Models
Persistent models for Users, Creators, and Brands.
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class User(SQLModel, table=True):
    """Persistent user table for authentication.
    is_golden_demo is NEVER included in JWT — read server-side only.
    entity_id links to Creator.id or Brand.id depending on role.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str  # "creator" or "brand"
    entity_id: int  # FK to Creator.id or Brand.id depending on role
    is_golden_demo: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Creator(SQLModel, table=True):
    """Creator profile — both VIP (hand-curated) and Faker-generated."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    handle: str = Field(unique=True)
    niche: str
    sub_niche: str = Field(default="")
    follower_count: int
    engagement_rate: float  # e.g. 0.047 = 4.7%
    platforms: str = Field(default="")          # comma-separated: "YouTube,Instagram"
    bio: str = Field(default="")
    location: str = Field(default="")
    avg_video_views: int = Field(default=0)
    is_vip: bool = Field(default=False)


class Brand(SQLModel, table=True):
    """Brand profile — both VIP (hand-curated) and Faker-generated."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    industry: str
    sub_industry: str = Field(default="")
    budget_min: int = Field(default=0)          # USD per campaign
    budget_max: int = Field(default=0)
    target_niches: str = Field(default="")      # comma-separated ideal creator niches
    description: str = Field(default="")
    headquarters: str = Field(default="")
    preferred_platforms: str = Field(default="")
    is_vip: bool = Field(default=False)
