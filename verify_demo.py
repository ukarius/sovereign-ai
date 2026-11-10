"""
Sovereign OS — Golden Demo Verification Script
Run AFTER seeding (python seed.py) and starting the server (uvicorn main:app --port 8000).

8-point automated test suite:
  1. Health check
  2. Creator demo login
  3. Brand demo login
  4. Golden creator matches — Notion appears first, score ≥ 0.95
  5. Golden brand matches — Ali Abdaal present, score ≥ 0.95
  6. Regular user registration → real ML results (not golden)
  7. Invalid token rejected (401)
  8. /api/auth/me returns correct user
"""
import requests
import sys

BASE = "http://127.0.0.1:8000"
passed = 0
failed = 0


def test(name: str, condition: bool, detail: str = ""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅  {name}")
    else:
        failed += 1
        print(f"  ❌  {name} — {detail}")


def run():
    global passed, failed
    print("\n═══════════════════════════════════════════")
    print("  Sovereign OS — Golden Demo Verification")
    print("═══════════════════════════════════════════\n")

    # ── Test 1: Health Check ──
    try:
        r = requests.get(f"{BASE}/health")
        data = r.json()
        test("Health check returns 200",  r.status_code == 200)
        test("Health shows creators > 0", data.get("creators", 0) > 0, f"creators={data.get('creators')}")
        test("Health shows brands > 0",   data.get("brands", 0) > 0,   f"brands={data.get('brands')}")
    except Exception as e:
        test("Health check reachable", False, str(e))
        print("\n⛔ Server not running. Start with: uvicorn main:app --port 8000\n")
        return

    # ── Test 2: Creator Demo Login ──
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": "demo@sovereign.os",
        "password": "demo"
    })
    test("Creator demo login (200)", r.status_code == 200, f"status={r.status_code} body={r.text[:200]}")
    creator_data = r.json() if r.status_code == 200 else {}
    creator_token = creator_data.get("token", "")
    creator_entity_id = creator_data.get("entityId")
    test("Creator login returns entityId", creator_entity_id is not None, f"response={creator_data}")
    test("Creator login returns role=CREATOR", creator_data.get("role") == "CREATOR", f"role={creator_data.get('role')}")

    # ── Test 3: Brand Demo Login ──
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": "brand@sovereign.os",
        "password": "demo"
    })
    test("Brand demo login (200)", r.status_code == 200, f"status={r.status_code} body={r.text[:200]}")
    brand_data = r.json() if r.status_code == 200 else {}
    brand_token = brand_data.get("token", "")
    brand_entity_id = brand_data.get("entityId")
    test("Brand login returns entityId", brand_entity_id is not None, f"response={brand_data}")
    test("Brand login returns role=BRAND", brand_data.get("role") == "BRAND", f"role={brand_data.get('role')}")

    # ── Test 4: Golden Creator Matches ──
    if creator_token and creator_entity_id:
        r = requests.get(
            f"{BASE}/api/match/creator/{creator_entity_id}?top_n=6",
            headers={"Authorization": f"Bearer {creator_token}"}
        )
        test("Creator match endpoint (200)", r.status_code == 200, f"status={r.status_code}")
        matches = r.json() if r.status_code == 200 else []
        if matches:
            first = matches[0]
            test("First match is Notion",       first.get("brand_name") == "Notion",   f"got={first.get('brand_name')}")
            test("Notion score ≥ 0.95",         first.get("match_score", 0) >= 0.95,   f"score={first.get('match_score')}")
            test("Got 6 golden matches",        len(matches) == 6,                      f"count={len(matches)}")
            test("Match has reason",            len(first.get("match_reason", "")) > 20, f"reason={first.get('match_reason', '')[:50]}")
        else:
            test("Creator matches returned data", False, "empty response")

    # ── Test 5: Golden Brand Matches ──
    if brand_token and brand_entity_id:
        r = requests.get(
            f"{BASE}/api/match/brand/{brand_entity_id}?top_n=6",
            headers={"Authorization": f"Bearer {brand_token}"}
        )
        test("Brand match endpoint (200)", r.status_code == 200, f"status={r.status_code}")
        matches = r.json() if r.status_code == 200 else []
        if matches:
            names = [m.get("creator_name") for m in matches]
            test("Ali Abdaal in brand matches",   "Ali Abdaal" in names,    f"names={names}")
            ali = next((m for m in matches if m.get("creator_name") == "Ali Abdaal"), {})
            test("Ali Abdaal score ≥ 0.95",       ali.get("match_score", 0) >= 0.95, f"score={ali.get('match_score')}")
            test("Got 6 golden matches",          len(matches) == 6,         f"count={len(matches)}")
        else:
            test("Brand matches returned data", False, "empty response")

    # ── Test 6: Regular User Registration → Real ML ──
    import time
    unique_email = f"test_{int(time.time())}@verify.test"
    r = requests.post(f"{BASE}/api/auth/register", json={
        "name": "Test Verifier",
        "email": unique_email,
        "password": "testpass",
        "role": "CREATOR",
        "niche": "Testing"
    })
    test("Registration (200)", r.status_code == 200, f"status={r.status_code} body={r.text[:200]}")
    if r.status_code == 200:
        reg_data = r.json()
        reg_token = reg_data.get("token", "")
        reg_entity_id = reg_data.get("entityId")

        # This user is NOT golden — should get real ML matches (not the 6 curated ones)
        if reg_entity_id:
            mr = requests.get(
                f"{BASE}/api/match/creator/{reg_entity_id}?top_n=3",
                headers={"Authorization": f"Bearer {reg_token}"}
            )
            test("Regular user gets ML matches (200)", mr.status_code == 200, f"status={mr.status_code}")
            # Real ML matches should NOT have Notion as first with 0.98
            ml_matches = mr.json() if mr.status_code == 200 else []
            if ml_matches:
                is_golden = ml_matches[0].get("brand_name") == "Notion" and ml_matches[0].get("match_score", 0) >= 0.98
                test("Regular user gets REAL results (not golden)", not is_golden,
                     f"first_match={ml_matches[0].get('brand_name')} score={ml_matches[0].get('match_score')}")

    # ── Test 7: Invalid Token Rejected ──
    r = requests.get(
        f"{BASE}/api/auth/me",
        headers={"Authorization": "Bearer invalid_garbage_token_xyz"}
    )
    test("Invalid token returns 401", r.status_code == 401, f"status={r.status_code}")

    # ── Test 8: /api/auth/me works with valid token ──
    if creator_token:
        r = requests.get(
            f"{BASE}/api/auth/me",
            headers={"Authorization": f"Bearer {creator_token}"}
        )
        test("/api/auth/me returns 200", r.status_code == 200, f"status={r.status_code}")
        me = r.json() if r.status_code == 200 else {}
        test("/api/auth/me returns entityId", me.get("entityId") is not None, f"response={me}")
        test("/api/auth/me returns correct email", me.get("email") == "demo@sovereign.os", f"email={me.get('email')}")

    # ── Summary ──
    total = passed + failed
    print(f"\n{'═' * 45}")
    print(f"  Results: {passed}/{total} tests passed")
    print(f"{'═' * 45}")

    if failed == 0:
        print("  🎉 System is pitch-ready!\n")
    else:
        print(f"  ⚠️  {failed} test(s) failed — review above.\n")
        sys.exit(1)


if __name__ == "__main__":
    run()
