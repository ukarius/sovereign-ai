"""
Sovereign OS — FastAPI Backend (Golden Demo Architecture)
  - Secure Auth (register, login, me) with SQLite + Bcrypt + JWT
  - ML Matchmaker APIs (TF-IDF, KNN)
  - Golden Demo bypass for pitch-ready curated matches
  - CORS enabled for cross-origin frontend
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from sqlmodel import Session, select

from database_new import create_db_and_tables, get_session
from models import User, Creator, Brand
from schemas import (
    LoginRequest, RegisterRequest, TokenResponse,
    CreatorMatchResult, BrandMatchResult,
    CreatorPublic, BrandPublic,
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user,
)
from ml_matchmaker import (
    compute_tfidf_creator_matches,
    compute_tfidf_brand_matches,
    get_similar_creators,
)


# ═══════════════════════════════════════════════════════════
#  Golden Demo Templates
#  Names, scores, and reasons are hardcoded.
#  IDs are ALWAYS resolved from the DB by name/handle.
# ═══════════════════════════════════════════════════════════

_GOLDEN_CREATOR_TEMPLATE = [
    dict(brand_name="Notion",       industry="SaaS / Productivity",  match_score=0.98, match_reason="Your productivity-focused audience of 5.2M aligns perfectly with Notion's power-user demographic. Previous sponsorships in this niche average 4.1% CTR.",                                       budget_range="$15k–$150k per video"),
    dict(brand_name="Brilliant",    industry="EdTech",               match_score=0.95, match_reason="Your audience skews highly educated and curious — identical to Brilliant's core converter profile. Strong fit for long-form integration.",                                                       budget_range="$12k–$100k per video"),
    dict(brand_name="Vercel",       industry="Developer Tools",      match_score=0.91, match_reason="24% of your audience works in tech roles. Vercel's developer tool positioning resonates strongly with this segment.",                                                                          budget_range="$20k–$200k per campaign"),
    dict(brand_name="Raycast",      industry="Developer Tools",      match_score=0.88, match_reason="Raycast is actively expanding creator partnerships. Your Mac-focused content history is a strong match signal.",                                                                               budget_range="$10k–$90k per video"),
    dict(brand_name="Morning Brew", industry="Media / Newsletter",   match_score=0.85, match_reason="Your newsletter subscribers (280k+) make you uniquely valuable for cross-promotion deals with Morning Brew.",                                                                                  budget_range="$5k–$50k per placement"),
    dict(brand_name="Calm",         industry="Mental Wellness",      match_score=0.82, match_reason="Your themes of burnout prevention and sustainable productivity resonate with Calm's messaging pillars.",                                                                                       budget_range="$10k–$100k per video"),
]

_GOLDEN_BRAND_TEMPLATE = [
    dict(creator_handle="mkbhd",       creator_name="Marques Brownlee",  niche="Tech",                follower_count=18500000, engagement_rate=0.041, match_score=0.97, match_reason="MKBHD's audience is 68% professionals aged 25–40 — your highest-converting demographic. His product review credibility transfers directly to software."),
    dict(creator_handle="aliabdaal",   creator_name="Ali Abdaal",        niche="Productivity",        follower_count=5200000,  engagement_rate=0.063, match_score=0.98, match_reason="Strongest possible niche alignment. Ali's audience actively seeks productivity tools and has demonstrated 6.3% engagement — above category average by 2.1x."),
    dict(creator_handle="thomasfrank", creator_name="Thomas Frank",      niche="Productivity",        follower_count=3100000,  engagement_rate=0.058, match_score=0.94, match_reason="Thomas's audience is student and early-career professionals — high lifetime value segment for Notion's subscription model."),
    dict(creator_handle="fireship",    creator_name="Fireship",          niche="Programming",         follower_count=3800000,  engagement_rate=0.081, match_score=0.89, match_reason="Developer-heavy audience with extremely high purchase intent for productivity/workflow tools. 8.1% engagement rate is exceptional for this niche."),
    dict(creator_handle="lexfridman",  creator_name="Lex Fridman",       niche="Technology/AI",       follower_count=4200000,  engagement_rate=0.033, match_score=0.84, match_reason="Premium audience of researchers, engineers, and founders. Lower engagement offset by extremely high-value demographic for B2B tool adoption."),
    dict(creator_handle="nateliason",  creator_name="Nat Eliason",       niche="Writing/Productivity", follower_count=890000,  engagement_rate=0.072, match_score=0.81, match_reason="Nano-tier influencer with exceptional newsletter crossover. 72% of his audience already uses Notion or a direct competitor — high switch-intent segment."),
]


def build_golden_creator_matches(session: Session) -> list[CreatorMatchResult]:
    """
    Resolve brand IDs from the database by name, then assemble the golden response.
    Never assumes any specific integer ID — looks up by Brand.name each time.
    """
    results = []
    for item in _GOLDEN_CREATOR_TEMPLATE:
        brand = session.exec(select(Brand).where(Brand.name == item["brand_name"])).first()
        if not brand:
            print(f"WARNING: Golden demo brand '{item['brand_name']}' not found in DB — did seeder run?")
            continue
        results.append(CreatorMatchResult(
            brand_id=brand.id,
            brand_name=item["brand_name"],
            industry=item["industry"],
            match_score=item["match_score"],
            match_reason=item["match_reason"],
            budget_range=item["budget_range"],
        ))
    return results


def build_golden_brand_matches(session: Session) -> list[BrandMatchResult]:
    """
    Resolve creator IDs from the database by handle, then assemble the golden response.
    Never assumes any specific integer ID — looks up by Creator.handle each time.
    """
    results = []
    for item in _GOLDEN_BRAND_TEMPLATE:
        creator = session.exec(select(Creator).where(Creator.handle == item["creator_handle"])).first()
        if not creator:
            print(f"WARNING: Golden demo creator '{item['creator_handle']}' not found in DB — did seeder run?")
            continue
        results.append(BrandMatchResult(
            creator_id=creator.id,
            creator_name=item["creator_name"],
            handle=item["creator_handle"],
            niche=item["niche"],
            follower_count=item["follower_count"],
            engagement_rate=item["engagement_rate"],
            match_score=item["match_score"],
            match_reason=item["match_reason"],
        ))
    return results


def _resolve_entity_name(user: User, session: Session) -> str:
    """Derive display name from the linked Creator/Brand entity."""
    if user.role == "CREATOR":
        entity = session.get(Creator, user.entity_id)
        return entity.name if entity else "Creator"
    else:
        entity = session.get(Brand, user.entity_id)
        return entity.name if entity else "Brand"


# ═══════════ Lifespan ═══════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing SQLite database (SQLModel)...")
    create_db_and_tables()
    print("Database ready. Run 'python seed.py' to seed VIP + Faker data.")
    yield
    print("Shutting down...")


app = FastAPI(
    title="Sovereign OS API",
    description="Creator × Brand matching platform with Golden Demo bypass",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — mandatory for cross-origin frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════ Auth Endpoints ═══════════

@app.post("/api/auth/login")
async def login(request: LoginRequest, session: Session = Depends(get_session)):
    """Authenticate user and return a JWT access token.
    Derives display name from the linked Creator/Brand entity.
    """
    user = session.exec(select(User).where(User.email == request.email)).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Derive name from linked entity
    name = _resolve_entity_name(user, session)

    # Generate JWT — NEVER include is_golden_demo
    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {
        "token": token,
        "userId": user.id,
        "name": name,
        "email": user.email,
        "role": user.role,
        "entityId": user.entity_id,
    }


@app.post("/api/auth/register")
async def register(request: RegisterRequest, session: Session = Depends(get_session)):
    """Register a new user. Creates a basic Creator/Brand entity first, then links it."""
    # Validate role
    if request.role not in ("CREATOR", "BRAND"):
        raise HTTPException(status_code=400, detail="Role must be CREATOR or BRAND")

    # Check if email already exists
    existing = session.exec(select(User).where(User.email == request.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create the linked entity first
    if request.role == "CREATOR":
        entity = Creator(
            name=request.name,
            handle=request.email.split("@")[0].lower().replace(".", "_"),
            niche=request.niche or "General",
            sub_niche="",
            follower_count=0,
            engagement_rate=0.0,
            platforms="",
            bio="",
            location="",
            avg_video_views=0,
            is_vip=False,
        )
        session.add(entity)
        session.commit()
        session.refresh(entity)
    else:
        entity = Brand(
            name=request.name,
            industry=request.industry or "General",
            sub_industry="",
            budget_min=0,
            budget_max=0,
            target_niches="",
            description="",
            headquarters="",
            preferred_platforms="",
            is_vip=False,
        )
        session.add(entity)
        session.commit()
        session.refresh(entity)

    # Create user linked to entity
    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        role=request.role,
        entity_id=entity.id,
        is_golden_demo=False,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate JWT
    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {
        "token": token,
        "userId": user.id,
        "name": request.name,
        "email": user.email,
        "role": user.role,
        "entityId": user.entity_id,
    }


@app.get("/api/auth/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Protected endpoint: return current user from JWT."""
    name = _resolve_entity_name(current_user, session)
    return {
        "userId": current_user.id,
        "name": name,
        "email": current_user.email,
        "role": current_user.role,
        "entityId": current_user.entity_id,
    }


# ═══════════ ML Matchmaker APIs ═══════════

@app.get("/api/match/creator/{creator_id}", response_model=list[CreatorMatchResult])
async def match_creator(
    creator_id: int,
    top_n: int = Query(10, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Match a creator with brands.
    Golden demo bypass: if the requesting user is a golden demo creator
    AND they're requesting their own entity, serve handcrafted matches.
    """
    if current_user.is_golden_demo and current_user.role == "CREATOR" and creator_id == current_user.entity_id:
        print(f"Golden demo creator response served for {current_user.email}")
        return build_golden_creator_matches(session)

    # Real TF-IDF matching
    creator = session.get(Creator, creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    all_brands = session.exec(select(Brand)).all()
    matches = compute_tfidf_creator_matches(creator, list(all_brands), top_k=top_n)
    return matches


@app.get("/api/match/brand/{brand_id}", response_model=list[BrandMatchResult])
async def match_brand(
    brand_id: int,
    top_n: int = Query(10, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Match a brand with creators.
    Golden demo bypass: if the requesting user is a golden demo brand
    AND they're requesting their own entity, serve handcrafted matches.
    """
    if current_user.is_golden_demo and current_user.role == "BRAND" and brand_id == current_user.entity_id:
        print(f"Golden demo brand response served for {current_user.email}")
        return build_golden_brand_matches(session)

    # Real TF-IDF matching
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    all_creators = session.exec(select(Creator)).all()
    matches = compute_tfidf_brand_matches(brand, list(all_creators), top_k=top_n)
    return matches


@app.get("/api/creators")
def get_creators(
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    """Paginated creator list (for ML widgets)."""
    creators = session.exec(select(Creator).offset(skip).limit(limit)).all()
    total = session.exec(select(Creator)).all()
    return {
        "total": len(total),
        "data": [CreatorPublic.model_validate(c) for c in creators],
    }


@app.get("/api/brands")
def get_brands(
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    """Paginated brand list (for ML widgets)."""
    brands = session.exec(select(Brand).offset(skip).limit(limit)).all()
    total = session.exec(select(Brand)).all()
    return {
        "total": len(total),
        "data": [BrandPublic.model_validate(b) for b in brands],
    }


@app.get("/api/analytics/peers/{creator_id}")
def get_peers(
    creator_id: int,
    k: int = Query(4, ge=1, le=10),
    session: Session = Depends(get_session),
):
    """KNN peer analytics for a creator."""
    target_creator = session.get(Creator, creator_id)
    if not target_creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    all_creators = session.exec(select(Creator)).all()
    peers = get_similar_creators(target_creator, list(all_creators), k=k)
    return peers


# ═══════════ Health Check ═══════════

@app.get("/health")
def health_check(session: Session = Depends(get_session)):
    """Platform health check with stats."""
    creator_count = len(session.exec(select(Creator)).all())
    brand_count = len(session.exec(select(Brand)).all())
    user_count = len(session.exec(select(User)).all())
    return {
        "status": "ok",
        "creators": creator_count,
        "brands": brand_count,
        "users": user_count,
        "version": "2.0.0 (Golden Demo)",
    }
