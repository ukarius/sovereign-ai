"""
Sovereign OS — Standalone Seeder Script
Run once with: python seed.py
Idempotent — safe to re-run (skips duplicates).

Seeds:
  - 20 VIP Creators (real influencers)
  - 20 VIP Brands (real companies)
  - 980 Faker Creators (total 1000)
  - 480 Faker Brands (total 500)
  - 2 Golden Demo Users (demo@sovereign.os, brand@sovereign.os)
"""
import random
from faker import Faker
from sqlmodel import Session, select

from database_new import engine, create_db_and_tables
from models import User, Creator, Brand
from auth import get_password_hash

fake = Faker()
Faker.seed(42)
random.seed(42)


# ═══════════════ VIP Creator Data ═══════════════

VIP_CREATORS = [
    dict(name="Marques Brownlee",     handle="mkbhd",            niche="Tech",               sub_niche="Consumer Electronics", follower_count=18500000, engagement_rate=0.041, platforms="YouTube,Instagram,Twitter",    bio="Tech reviewer and filmmaker creating the internet's most-watched gadget reviews.",             location="New Jersey, USA",    avg_video_views=8200000),
    dict(name="MrBeast",              handle="mrbeast",           niche="Entertainment",       sub_niche="Challenge/Philanthropy", follower_count=234000000, engagement_rate=0.089, platforms="YouTube,Instagram,TikTok",   bio="Creator of the world's most-viewed challenge videos and philanthropic stunts.",                  location="North Carolina, USA", avg_video_views=120000000),
    dict(name="Ali Abdaal",           handle="aliabdaal",         niche="Productivity",        sub_niche="Knowledge Work",   follower_count=5200000,  engagement_rate=0.063, platforms="YouTube,Instagram,Newsletter", bio="Former doctor turned productivity YouTuber. Author of Feel-Good Productivity.",                  location="London, UK",          avg_video_views=1500000),
    dict(name="Cleo Abram",           handle="cleoabram",         niche="Science",             sub_niche="Optimistic Tech",  follower_count=2100000,  engagement_rate=0.071, platforms="YouTube,Instagram",            bio="Making the future feel less scary through deeply researched, beautifully animated explainers.",   location="New York, USA",       avg_video_views=900000),
    dict(name="Linus Sebastian",      handle="linustechtips",     niche="Tech",               sub_niche="PC Hardware",      follower_count=16800000, engagement_rate=0.038, platforms="YouTube,Twitter",              bio="CEO of Linus Media Group. The internet's most prolific tech channel.",                            location="Vancouver, Canada",   avg_video_views=4500000),
    dict(name="Emma Chamberlain",     handle="emmachamberlain",   niche="Lifestyle",           sub_niche="Culture/Coffee",   follower_count=12400000, engagement_rate=0.055, platforms="YouTube,Instagram,TikTok",    bio="Redefining the vlog format. Host of Anything Goes podcast.",                                     location="Los Angeles, USA",    avg_video_views=3200000),
    dict(name="CGP Grey",             handle="cgpgrey",           niche="Education",           sub_niche="Systems Thinking", follower_count=6300000,  engagement_rate=0.044, platforms="YouTube",                     bio="Explains complex systems with meticulously crafted animations.",                                  location="London, UK",          avg_video_views=5000000),
    dict(name="Kurzgesagt",           handle="kurzgesagt",        niche="Science",             sub_niche="Animated Science", follower_count=22100000, engagement_rate=0.052, platforms="YouTube,Instagram",            bio="In a Nutshell — beautiful science animations explaining the universe.",                          location="Munich, Germany",     avg_video_views=10000000),
    dict(name="Lex Fridman",          handle="lexfridman",        niche="Technology/AI",       sub_niche="Long-form Interview", follower_count=4200000, engagement_rate=0.033, platforms="YouTube,Twitter",            bio="MIT researcher hosting deep conversations with the world's greatest minds.",                     location="Austin, USA",         avg_video_views=2000000),
    dict(name="Thomas Frank",         handle="thomasfrank",       niche="Productivity",        sub_niche="Student/Career",   follower_count=3100000,  engagement_rate=0.058, platforms="YouTube,Instagram",            bio="Productivity systems for students and knowledge workers. Notion ambassador.",                     location="Denver, USA",         avg_video_views=800000),
    dict(name="Veritasium",           handle="veritasium",        niche="Science",             sub_niche="Physics/Engineering", follower_count=15600000, engagement_rate=0.047, platforms="YouTube,Instagram",          bio="An element of truth — science videos about physics, engineering, and the unexpected.",            location="Los Angeles, USA",    avg_video_views=8000000),
    dict(name="Wendover Productions", handle="wendover",          niche="Geography/Business",  sub_niche="Logistics",        follower_count=4800000,  engagement_rate=0.041, platforms="YouTube",                     bio="The logistics, economics, and geography that shape our world.",                                  location="New York, USA",       avg_video_views=3000000),
    dict(name="Nerdwriter1",          handle="nerdwriter1",       niche="Culture/Analysis",    sub_niche="Video Essay",      follower_count=3400000,  engagement_rate=0.049, platforms="YouTube",                     bio="Video essays on art, culture, politics, and the human condition.",                               location="Los Angeles, USA",    avg_video_views=1200000),
    dict(name="Simone Giertz",        handle="simonegiertz",      niche="DIY/Engineering",     sub_niche="Comedy Inventions", follower_count=2900000, engagement_rate=0.067, platforms="YouTube,Instagram",           bio="Queen of shitty robots. Building unnecessary things with engineering skill and humor.",           location="San Francisco, USA",  avg_video_views=1500000),
    dict(name="Johnny Harris",        handle="johnnyharris",      niche="Geopolitics",         sub_niche="Visual Journalism", follower_count=5700000, engagement_rate=0.062, platforms="YouTube,Instagram",           bio="Former Vox journalist. Explains borders, wars, and global power through cinematic storytelling.", location="Washington DC, USA",  avg_video_views=3500000),
    dict(name="Nat Eliason",          handle="nateliason",        niche="Writing/Productivity", sub_niche="Newsletter",      follower_count=890000,   engagement_rate=0.072, platforms="Newsletter,Twitter",          bio="Writer, entrepreneur, and SEO strategist. Author of Growth Machine.",                            location="Austin, USA",         avg_video_views=200000),
    dict(name="Jaime Rivera",         handle="jaimewithgadgets",  niche="Consumer Tech",       sub_niche="Mobile Reviews",   follower_count=1200000,  engagement_rate=0.054, platforms="YouTube,Instagram",            bio="Bilingual tech reviewer specializing in smartphones and mobile ecosystems.",                      location="Miami, USA",          avg_video_views=400000),
    dict(name="Sarah Dietschy",       handle="sarahdietschy",     niche="Tech/Lifestyle",      sub_niche="Creator Economy",  follower_count=1600000,  engagement_rate=0.059, platforms="YouTube,Instagram",            bio="Tech and lifestyle content exploring the creator economy and remote work culture.",               location="New York, USA",       avg_video_views=500000),
    dict(name="Fireship",             handle="fireship",          niche="Programming",         sub_niche="Web Development",  follower_count=3800000,  engagement_rate=0.081, platforms="YouTube,Twitter",              bio="Code in 100 seconds. Fast-paced programming tutorials and tech news.",                           location="USA",                 avg_video_views=2500000),
    dict(name="Kevin Parry",          handle="kevinparry",        niche="Creative/VFX",        sub_niche="Stop Motion",      follower_count=2400000,  engagement_rate=0.093, platforms="TikTok,Instagram",             bio="Stop-motion animator and VFX artist creating viral transformation videos.",                       location="Toronto, Canada",     avg_video_views=5000000),
]


# ═══════════════ VIP Brand Data ═══════════════

VIP_BRANDS = [
    dict(name="Notion",           industry="SaaS/Productivity",    sub_industry="Knowledge Management", budget_min=15000,  budget_max=150000,  target_niches="Productivity,Education,Tech",               description="All-in-one workspace for notes, docs, and project management.",           headquarters="San Francisco, USA", preferred_platforms="YouTube,Newsletter"),
    dict(name="Vercel",           industry="Developer Tools",      sub_industry="Frontend Cloud",       budget_min=20000,  budget_max=200000,  target_niches="Programming,Tech,Startup",                  description="Frontend cloud platform enabling developers to ship faster.",              headquarters="San Francisco, USA", preferred_platforms="YouTube,Twitter"),
    dict(name="Rivian",           industry="Electric Vehicles",    sub_industry="Adventure EVs",        budget_min=50000,  budget_max=500000,  target_niches="Tech,Sustainability,Auto",                  description="Electric adventure vehicles designed for the great outdoors.",              headquarters="Irvine, USA",        preferred_platforms="YouTube,Instagram"),
    dict(name="Shopify",          industry="E-commerce",           sub_industry="Merchant Platform",    budget_min=25000,  budget_max=250000,  target_niches="Business,Entrepreneurship",                 description="Commerce platform powering millions of businesses worldwide.",             headquarters="Ottawa, Canada",     preferred_platforms="YouTube,Instagram,TikTok"),
    dict(name="Nike",             industry="Sportswear",           sub_industry="Athletic Performance", budget_min=100000, budget_max=2000000, target_niches="Fitness,Lifestyle,Sports",                  description="Global leader in athletic footwear, apparel, and innovation.",             headquarters="Beaverton, USA",     preferred_platforms="YouTube,Instagram,TikTok"),
    dict(name="Stripe",           industry="Fintech",              sub_industry="Payment Processing",   budget_min=30000,  budget_max=300000,  target_niches="Business,Tech,Startup",                     description="Financial infrastructure for the internet economy.",                        headquarters="San Francisco, USA", preferred_platforms="YouTube,Twitter"),
    dict(name="Figma",            industry="Design Tools",         sub_industry="Collaborative Design", budget_min=15000,  budget_max=120000,  target_niches="Design,Tech,Creative",                      description="Collaborative interface design tool used by top product teams.",            headquarters="San Francisco, USA", preferred_platforms="YouTube,Twitter"),
    dict(name="Squarespace",      industry="Website Builder",      sub_industry="Creative Websites",    budget_min=20000,  budget_max=180000,  target_niches="Creative,Business,Lifestyle",               description="Build beautiful websites with an all-in-one platform.",                     headquarters="New York, USA",      preferred_platforms="YouTube,Instagram"),
    dict(name="NordVPN",          industry="Cybersecurity",        sub_industry="Consumer VPN",         budget_min=10000,  budget_max=80000,   target_niches="Tech,Privacy,Gaming",                       description="Leading VPN service protecting privacy for millions of users.",             headquarters="Panama City, Panama", preferred_platforms="YouTube,TikTok"),
    dict(name="Brilliant",        industry="EdTech",               sub_industry="Interactive Learning", budget_min=12000,  budget_max=100000,  target_niches="Science,Education,Math",                    description="Interactive STEM learning platform with bite-sized daily challenges.",       headquarters="San Francisco, USA", preferred_platforms="YouTube"),
    dict(name="Athletic Greens",  industry="Health",               sub_industry="Nutritional Supplements", budget_min=8000, budget_max=75000, target_niches="Fitness,Wellness,Lifestyle",                description="AG1 — comprehensive daily nutrition in a single scoop.",                     headquarters="New Zealand",        preferred_platforms="YouTube,Instagram"),
    dict(name="Morning Brew",     industry="Media",                sub_industry="Business Newsletter",  budget_min=5000,   budget_max=50000,   target_niches="Business,Finance,Newsletter",               description="Daily newsletter making business news entertaining and accessible.",         headquarters="New York, USA",      preferred_platforms="YouTube,Newsletter"),
    dict(name="Raycast",          industry="Developer Tools",      sub_industry="Productivity Launcher", budget_min=10000, budget_max=90000,  target_niches="Programming,Productivity",                  description="Blazingly fast Mac launcher that supercharges developer workflows.",         headquarters="London, UK",         preferred_platforms="YouTube,Twitter"),
    dict(name="Linear",           industry="Project Management",   sub_industry="Issue Tracking",       budget_min=15000,  budget_max=130000,  target_niches="Tech,Startup,Programming",                  description="Streamlined issue tracking built for modern software teams.",                headquarters="San Francisco, USA", preferred_platforms="YouTube,Twitter"),
    dict(name="Loom",             industry="Video Communication",  sub_industry="Async Video",          budget_min=12000,  budget_max=110000,  target_niches="Business,Productivity,Tech",                description="Record quick videos to communicate with your team async.",                  headquarters="San Francisco, USA", preferred_platforms="YouTube"),
    dict(name="Liquid Death",     industry="Beverages",            sub_industry="Canned Water",         budget_min=20000,  budget_max=200000,  target_niches="Entertainment,Lifestyle",                   description="Mountain water in a can. Murder your thirst.",                               headquarters="Los Angeles, USA",   preferred_platforms="YouTube,TikTok,Instagram"),
    dict(name="Duolingo",         industry="EdTech",               sub_industry="Language Learning",    budget_min=30000,  budget_max=280000,  target_niches="Education,Language,Lifestyle",              description="The world's #1 language learning app with a unhinged social media presence.", headquarters="Pittsburgh, USA",    preferred_platforms="TikTok,YouTube,Instagram"),
    dict(name="Frame.io",         industry="Video Tools",          sub_industry="Video Collaboration",  budget_min=15000,  budget_max=140000,  target_niches="Creative,Video,Film",                       description="Video review and collaboration platform for creative teams.",                headquarters="New York, USA",      preferred_platforms="YouTube"),
    dict(name="Calm",             industry="Mental Wellness",      sub_industry="Meditation App",       budget_min=10000,  budget_max=100000,  target_niches="Wellness,Lifestyle,Productivity",           description="The #1 app for sleep, meditation, and relaxation.",                          headquarters="San Francisco, USA", preferred_platforms="YouTube,Instagram"),
    dict(name="Midjourney",       industry="AI Tools",             sub_industry="Image Generation",     budget_min=25000,  budget_max=220000,  target_niches="Creative,Tech,AI",                          description="AI-powered image generation creating stunning visuals from text prompts.",   headquarters="San Francisco, USA", preferred_platforms="YouTube,Twitter"),
]


# ═══════════════ Faker Config ═══════════════

FAKER_NICHES = ["Gaming", "Cooking", "Travel", "Finance", "Fitness",
                "Beauty", "Parenting", "Comedy", "Music", "Art"]

FAKER_BRAND_INDUSTRIES = ["Fashion", "Food & Beverage", "Software", "Healthcare",
                          "Finance", "Travel", "Gaming", "Automotive", "Home", "Retail"]

PLATFORM_OPTIONS = ["YouTube", "Instagram", "TikTok", "Twitter", "Newsletter"]

BUDGET_MIN_OPTIONS = [2000, 5000, 8000, 10000, 15000, 25000]


def seed():
    """Idempotent seeder: inserts VIP + Faker data, skips duplicates."""
    create_db_and_tables()

    created_creators = 0
    created_brands = 0
    created_users = 0
    skipped = 0

    with Session(engine) as session:

        # ── Step 1: VIP Creators ──
        for c in VIP_CREATORS:
            existing = session.exec(select(Creator).where(Creator.handle == c["handle"])).first()
            if existing:
                skipped += 1
                continue
            session.add(Creator(**c, is_vip=True))
            created_creators += 1

        # ── Step 2: VIP Brands ──
        for b in VIP_BRANDS:
            existing = session.exec(select(Brand).where(Brand.name == b["name"])).first()
            if existing:
                skipped += 1
                continue
            session.add(Brand(**b, is_vip=True))
            created_brands += 1

        session.commit()

        # ── Step 3: Faker Creators (980 to reach 1000 total) ──
        for i in range(980):
            handle = f"creator_{fake.unique.user_name()}"
            existing = session.exec(select(Creator).where(Creator.handle == handle)).first()
            if existing:
                skipped += 1
                continue
            niche = random.choice(FAKER_NICHES)
            follower_count = random.randint(50000, 4000000)
            session.add(Creator(
                name=fake.name(),
                handle=handle,
                niche=niche,
                sub_niche=f"General {niche}",
                follower_count=follower_count,
                engagement_rate=round(random.uniform(0.018, 0.085), 4),
                platforms=",".join(random.sample(PLATFORM_OPTIONS, k=random.randint(1, 3))),
                bio=fake.sentence(nb_words=12),
                location=f"{fake.city()}, {fake.country()}",
                avg_video_views=int(follower_count * random.uniform(0.05, 0.4)),
                is_vip=False,
            ))
            created_creators += 1

        session.commit()

        # ── Step 4: Faker Brands (480 to reach 500 total) ──
        for i in range(480):
            name = fake.company()
            existing = session.exec(select(Brand).where(Brand.name == name)).first()
            if existing:
                skipped += 1
                continue
            industry = random.choice(FAKER_BRAND_INDUSTRIES)
            budget_min = random.choice(BUDGET_MIN_OPTIONS)
            session.add(Brand(
                name=name,
                industry=industry,
                sub_industry=f"General {industry}",
                budget_min=budget_min,
                budget_max=budget_min * random.randint(5, 20),
                target_niches=",".join(random.sample(FAKER_NICHES, k=random.randint(2, 4))),
                description=fake.sentence(nb_words=10),
                headquarters=f"{fake.city()}, {fake.country()}",
                preferred_platforms=",".join(random.sample(PLATFORM_OPTIONS, k=random.randint(1, 3))),
                is_vip=False,
            ))
            created_brands += 1

        session.commit()

        # ── Step 5: Golden Demo Users ──
        # Creator demo → linked to Ali Abdaal
        ali = session.exec(select(Creator).where(Creator.handle == "aliabdaal")).first()
        if ali:
            existing = session.exec(select(User).where(User.email == "demo@sovereign.os")).first()
            if existing:
                skipped += 1
            else:
                session.add(User(
                    email="demo@sovereign.os",
                    hashed_password=get_password_hash("demo"),
                    role="CREATOR",
                    entity_id=ali.id,
                    is_golden_demo=True,
                ))
                created_users += 1
        else:
            print("WARNING: Ali Abdaal not found — creator demo user not created!")

        # Brand demo → linked to Notion
        notion = session.exec(select(Brand).where(Brand.name == "Notion")).first()
        if notion:
            existing = session.exec(select(User).where(User.email == "brand@sovereign.os")).first()
            if existing:
                skipped += 1
            else:
                session.add(User(
                    email="brand@sovereign.os",
                    hashed_password=get_password_hash("demo"),
                    role="BRAND",
                    entity_id=notion.id,
                    is_golden_demo=True,
                ))
                created_users += 1
        else:
            print("WARNING: Notion not found — brand demo user not created!")

        session.commit()

    total_new = created_creators + created_brands + created_users
    print(f"Seeded {created_creators} creators, {created_brands} brands, {created_users} users ({skipped} skipped as duplicates)")
    print(f"Total new records: {total_new}")


if __name__ == "__main__":
    seed()
