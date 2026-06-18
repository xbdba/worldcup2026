from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timedelta, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
SKILL_DIR = Path.home() / ".codex" / "skills" / "soccer-lottery"
CONFIG_PATH = SKILL_DIR / "config.yaml"
CACHE_PATH = ROOT / "worldcup_matches_cache.json"
API_BASE = "https://api.football-data.org/v4"
SPORTTERY_CALCULATOR_URL = "https://webapi.sporttery.cn/gateway/uniform/football/getMatchCalculatorV1.qry?channel=c"
CHINA_TZ = timezone(timedelta(hours=8))
WORLD_CUP_ENDPOINTS = [
    "competitions/WC/matches?season=2026",
    "matches?competitions=WC&dateFrom=2026-06-01&dateTo=2026-07-31",
]
HAD_OPTIONS = [("h", "主胜"), ("d", "平"), ("a", "客胜")]
CRS_OPTIONS = [
    ("s01s00", "1:0", "胜"), ("s02s00", "2:0", "胜"), ("s02s01", "2:1", "胜"),
    ("s03s00", "3:0", "胜"), ("s03s01", "3:1", "胜"), ("s03s02", "3:2", "胜"),
    ("s04s00", "4:0", "胜"), ("s04s01", "4:1", "胜"), ("s04s02", "4:2", "胜"),
    ("s05s00", "5:0", "胜"), ("s05s01", "5:1", "胜"), ("s05s02", "5:2", "胜"),
    ("h", "胜其他", "胜"),
    ("s00s00", "0:0", "平"), ("s01s01", "1:1", "平"), ("s02s02", "2:2", "平"),
    ("s03s03", "3:3", "平"), ("d", "平其他", "平"),
    ("s00s01", "0:1", "负"), ("s00s02", "0:2", "负"), ("s01s02", "1:2", "负"),
    ("s00s03", "0:3", "负"), ("s01s03", "1:3", "负"), ("s02s03", "2:3", "负"),
    ("s00s04", "0:4", "负"), ("s01s04", "1:4", "负"), ("s02s04", "2:4", "负"),
    ("s00s05", "0:5", "负"), ("s01s05", "1:5", "负"), ("s02s05", "2:5", "负"),
    ("a", "负其他", "负"),
]
TEAM_NAME_ZH = {
    "Algeria": "阿尔及利亚",
    "Argentina": "阿根廷",
    "Australia": "澳大利亚",
    "Austria": "奥地利",
    "Belgium": "比利时",
    "Bosnia-H.": "波黑",
    "Bosnia-Herzegovina": "波黑",
    "Brazil": "巴西",
    "Canada": "加拿大",
    "Cape Verde": "佛得角",
    "Cape Verde Islands": "佛得角",
    "Colombia": "哥伦比亚",
    "Congo DR": "民主刚果",
    "刚果金": "民主刚果",
    "刚果(金)": "民主刚果",
    "Croatia": "克罗地亚",
    "Curaçao": "库拉索",
    "Czechia": "捷克",
    "Ecuador": "厄瓜多尔",
    "Egypt": "埃及",
    "England": "英格兰",
    "France": "法国",
    "Germany": "德国",
    "Ghana": "加纳",
    "Haiti": "海地",
    "Iran": "伊朗",
    "Iraq": "伊拉克",
    "Ivory Coast": "科特迪瓦",
    "Japan": "日本",
    "Jordan": "约旦",
    "Korea Republic": "韩国",
    "Mexico": "墨西哥",
    "Morocco": "摩洛哥",
    "Netherlands": "荷兰",
    "New Zealand": "新西兰",
    "Norway": "挪威",
    "Panama": "巴拿马",
    "Paraguay": "巴拉圭",
    "Portugal": "葡萄牙",
    "Qatar": "卡塔尔",
    "Saudi Arabia": "沙特阿拉伯",
    "Scotland": "苏格兰",
    "Senegal": "塞内加尔",
    "South Africa": "南非",
    "South Korea": "韩国",
    "Spain": "西班牙",
    "Sweden": "瑞典",
    "Switzerland": "瑞士",
    "Tunisia": "突尼斯",
    "Turkey": "土耳其",
    "USA": "美国",
    "United States": "美国",
    "Uruguay": "乌拉圭",
    "Uzbekistan": "乌兹别克斯坦",
    "TBD": "待定",
    "TBA": "待定",
}


def load_football_data_key() -> str:
    if not CONFIG_PATH.exists():
        return ""
    text = CONFIG_PATH.read_text(encoding="utf-8")
    match = re.search(r"\bkey\s*:\s*[\"']?([^\"'\s#]+)", text)
    if not match:
        return ""
    key = match.group(1).strip()
    return "" if not key or "YOUR" in key.upper() else key


def request_football_data(endpoint: str, api_key: str) -> dict:
    request = Request(
        f"{API_BASE}/{endpoint}",
        headers={
            "Accept": "application/json",
            "User-Agent": "worldcup2026-ledger/1.0",
            "X-Auth-Token": api_key,
        },
    )
    with urlopen(request, timeout=18) as response:
        return json.loads(response.read().decode("utf-8"))


def request_sporttery() -> dict:
    request = Request(
        SPORTTERY_CALCULATOR_URL,
        headers={
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://www.sporttery.cn/jc/jsq/zqspf/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        },
    )
    with urlopen(request, timeout=18) as response:
        return json.loads(response.read().decode("utf-8"))


def to_number(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0


def pick_had(source: dict) -> list[dict]:
    if not isinstance(source, dict):
        return []
    return [
        {"key": key, "label": label, "odds": to_number(source.get(key))}
        for key, label in HAD_OPTIONS
        if to_number(source.get(key)) > 0
    ]


def pick_crs(source: dict) -> list[dict]:
    if not isinstance(source, dict):
        return []
    return [
        {"key": key, "label": label, "group": group, "odds": to_number(source.get(key))}
        for key, label, group in CRS_OPTIONS
        if to_number(source.get(key)) > 0
    ]


def normalize_sporttery(payload: dict) -> list[dict]:
    value = (payload or {}).get("value") or {}
    days = value.get("matchInfoList") or []
    matches = []
    for day in days:
        for item in day.get("subMatchList") or []:
            league = item.get("leagueAbbName") or item.get("leagueAllName") or ""
            if "世界杯" not in league:
                continue
            match = {
                "id": f"sp-{item.get('matchId') or item.get('matchNumStr') or item.get('matchNum') or ''}",
                "matchNum": item.get("matchNumStr") or str(item.get("matchNum") or ""),
                "matchNumDate": item.get("matchNumDate") or "",
                "league": "世界杯",
                "leagueFull": item.get("leagueAllName") or league,
                "competitionCode": "WC",
                "source": "sporttery",
                "sourceLabel": "中国体彩",
                "date": item.get("matchDate") or day.get("businessDate") or "",
                "time": str(item.get("matchTime") or "")[:5],
                "businessDate": item.get("businessDate") or day.get("businessDate") or "",
                "home": localize_team(item.get("homeTeamAbbName") or item.get("homeTeamAllName") or ""),
                "away": localize_team(item.get("awayTeamAbbName") or item.get("awayTeamAllName") or ""),
                "homeFull": localize_team(item.get("homeTeamAllName") or item.get("homeTeamAbbName") or ""),
                "awayFull": localize_team(item.get("awayTeamAllName") or item.get("awayTeamAbbName") or ""),
                "homeRank": item.get("homeTeamGroup") or item.get("homeTeamRank") or item.get("homeRank") or "",
                "awayRank": item.get("awayTeamGroup") or item.get("awayTeamRank") or item.get("awayRank") or "",
                "status": item.get("matchStatus") or "",
                "stage": item.get("groupName") or "",
                "oddsUpdatedAt": "",
                "markets": {},
                "result": None,
            }
            had = pick_had(item.get("had") or {})
            if had:
                match["markets"]["had"] = {
                    "label": "胜平负",
                    "goalLine": "0",
                    "options": had,
                    "updatedAt": join_date_time(item.get("had", {}).get("updateDate"), item.get("had", {}).get("updateTime")),
                }
            hhad = pick_had(item.get("hhad") or {})
            if hhad:
                goal_line = (item.get("hhad") or {}).get("goalLine") or (item.get("hhad") or {}).get("goalLineValue") or ""
                match["markets"]["hhad"] = {
                    "label": "让球胜平负",
                    "goalLine": goal_line,
                    "options": hhad,
                    "updatedAt": join_date_time(item.get("hhad", {}).get("updateDate"), item.get("hhad", {}).get("updateTime")),
                }
            crs = pick_crs(item.get("crs") or {})
            if crs:
                match["markets"]["crs"] = {
                    "label": "比分",
                    "goalLine": "",
                    "options": crs,
                    "updatedAt": join_date_time(item.get("crs", {}).get("updateDate"), item.get("crs", {}).get("updateTime")),
                }
            matches.append(match)
    return matches


def join_date_time(date_value: str | None, time_value: str | None) -> str:
    return " ".join([part for part in [date_value or "", time_value or ""] if part])


def localize_team(name: str | None) -> str:
    value = str(name or "").strip()
    if not value:
        return "待定"
    return TEAM_NAME_ZH.get(value, value)


def get_team_name(team: dict, short: bool = True) -> str:
    if not isinstance(team, dict):
        return ""
    choices = ["shortName", "tla", "name"] if short else ["name", "shortName", "tla"]
    for key in choices:
        value = str(team.get(key) or "").strip()
        if value and value.upper() not in {"TBD", "TBA"}:
            return value
    return str(team.get("name") or team.get("shortName") or "待定").strip() or "待定"


def kickoff_parts(utc_date: str) -> tuple[str, str]:
    if not utc_date:
        return "", ""
    try:
        value = datetime.fromisoformat(utc_date.replace("Z", "+00:00")).astimezone(CHINA_TZ)
    except ValueError:
        return utc_date[:10], utc_date[11:16]
    return value.strftime("%Y-%m-%d"), value.strftime("%H:%M")


def result_from_score(score: dict) -> dict | None:
    full_time = (score or {}).get("fullTime") or {}
    home = full_time.get("home")
    away = full_time.get("away")
    if home is None or away is None:
        return None
    return {
        "fullScore": f"{home}:{away}",
        "halfScore": "",
        "status": (score or {}).get("winner") or "",
    }


def normalize_matches(raw_matches: list[dict]) -> list[dict]:
    sorted_matches = sorted(raw_matches, key=lambda item: (item.get("utcDate") or "", item.get("id") or 0))
    matches = []
    for index, item in enumerate(sorted_matches, start=1):
        competition = item.get("competition") or {}
        home_team = item.get("homeTeam") or {}
        away_team = item.get("awayTeam") or {}
        match_date, match_time = kickoff_parts(item.get("utcDate") or "")
        stage = item.get("stage") or item.get("group") or ""
        matches.append(
            {
                "id": f"fd-{item.get('id')}",
                "matchNum": f"WC{index:03d}",
                "matchNumDate": match_date.replace("-", ""),
                "league": "世界杯",
                "leagueFull": competition.get("name") or "FIFA World Cup",
                "competitionCode": competition.get("code") or "WC",
                "source": "football-data",
                "sourceLabel": "Football-Data",
                "date": match_date,
                "time": match_time,
                "businessDate": match_date,
                "utcDate": item.get("utcDate") or "",
                "home": localize_team(get_team_name(home_team)),
                "away": localize_team(get_team_name(away_team)),
                "homeFull": localize_team(get_team_name(home_team, short=False)),
                "awayFull": localize_team(get_team_name(away_team, short=False)),
                "status": item.get("status") or "",
                "stage": stage,
                "matchday": item.get("matchday") or "",
                "oddsUpdatedAt": "",
                "markets": {},
                "result": result_from_score(item.get("score") or {}),
            }
        )
    return matches


def read_cache() -> dict | None:
    if not CACHE_PATH.exists():
        return None
    try:
        payload = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return payload if payload.get("matches") else None


def has_odds(match: dict) -> bool:
    markets = match.get("markets") or {}
    return any(isinstance(market.get("options"), list) and market.get("options") for market in markets.values() if isinstance(market, dict))


def team_key(value: str | None) -> str:
    return re.sub(r"\s+", "", localize_team(value).lower())


def match_key(match: dict) -> str:
    date = match.get("date") or match.get("businessDate") or ""
    home = team_key(match.get("homeFull") or match.get("home"))
    away = team_key(match.get("awayFull") or match.get("away"))
    if date and home and away and "待定" not in {home, away}:
        return f"{date}|{home}-{away}"
    return str(match.get("id") or match.get("matchNum") or f"{date}|{home}-{away}")


def normalize_cached_matches(matches: list[dict]) -> list[dict]:
    normalized = []
    for match in matches:
        if not isinstance(match, dict):
            continue
        league_text = f"{match.get('league') or ''} {match.get('leagueFull') or ''} {match.get('competitionCode') or ''}"
        if match.get("source") == "sporttery" and "世界杯" not in league_text and "World Cup" not in league_text:
            continue
        item = {
            **match,
            "league": "世界杯",
            "leagueFull": match.get("leagueFull") or "FIFA World Cup",
            "competitionCode": "WC",
            "businessDate": match.get("businessDate") or match.get("date") or "",
            "home": localize_team(match.get("home")),
            "away": localize_team(match.get("away")),
            "homeFull": localize_team(match.get("homeFull") or match.get("home")),
            "awayFull": localize_team(match.get("awayFull") or match.get("away")),
            "markets": match.get("markets") or {},
        }
        normalized.append(item)
    return sorted(normalized, key=lambda item: (item.get("date") or item.get("businessDate") or "", item.get("time") or "", item.get("matchNum") or ""))


def merge_schedule_and_odds(schedule_matches: list[dict], odds_matches: list[dict]) -> list[dict]:
    by_key = {match_key(match): match for match in normalize_cached_matches(schedule_matches)}
    for odds in normalize_cached_matches(odds_matches):
        key = match_key(odds)
        existing = by_key.get(key)
        if not existing:
            by_key[key] = odds
            continue
        by_key[key] = {
            **existing,
            "source": "sporttery" if has_odds(odds) else existing.get("source") or odds.get("source"),
            "sourceLabel": "中国体彩" if has_odds(odds) else existing.get("sourceLabel") or odds.get("sourceLabel"),
            "status": odds.get("status") or existing.get("status"),
            "oddsUpdatedAt": odds.get("oddsUpdatedAt") or existing.get("oddsUpdatedAt") or "",
            "markets": odds.get("markets") if has_odds(odds) else existing.get("markets") or {},
            "result": existing.get("result") or odds.get("result"),
        }
    return sorted(by_key.values(), key=lambda item: (item.get("date") or item.get("businessDate") or "", item.get("time") or "", item.get("matchNum") or ""))


def build_payload(matches: list[dict], source: str, endpoint: str, warning: str = "") -> dict:
    payload = {
        "success": True,
        "source": source,
        "endpoint": endpoint,
        "competition": "WC",
        "season": "2026",
        "generatedAt": datetime.now(CHINA_TZ).isoformat(timespec="seconds"),
        "matches": matches,
    }
    if warning:
        payload["warning"] = warning
    return payload


def fetch_worldcup_matches() -> dict:
    errors = []
    cached_payload = read_cache()
    cached_matches = normalize_cached_matches(cached_payload.get("matches", [])) if cached_payload else []
    sporttery_matches = []

    try:
        sporttery_payload = request_sporttery()
        sporttery_matches = normalize_sporttery(sporttery_payload)
        if sporttery_matches and cached_matches:
            return build_payload(
                merge_schedule_and_odds(cached_matches, sporttery_matches),
                "cache+sporttery",
                "cache+sporttery:getMatchCalculatorV1",
            )
        if sporttery_matches and len(sporttery_matches) >= 80:
            payload = build_payload(sporttery_matches, "sporttery", "sporttery:getMatchCalculatorV1")
            write_cache(payload)
            return payload
        errors.append("sporttery: 没有返回世界杯赔率")
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        errors.append(f"sporttery: {error}")

    api_key = load_football_data_key()
    if not api_key:
        return cache_or_error({
            "success": False,
            "source": "sporttery",
            "error": "；".join(errors + ["Football-Data 备用 API Key 未配置。"]),
            "matches": [],
        })

    for endpoint in WORLD_CUP_ENDPOINTS:
        try:
            payload = request_football_data(endpoint, api_key)
            raw_matches = payload.get("matches") or []
            worldcup_matches = [
                item
                for item in raw_matches
                if (item.get("competition") or {}).get("code") == "WC"
                or "World Cup" in str((item.get("competition") or {}).get("name") or "")
            ]
            if worldcup_matches:
                schedule = normalize_matches(worldcup_matches)
                merged = merge_schedule_and_odds(schedule, sporttery_matches)
                payload = build_payload(merged, "football-data+sporttery", endpoint)
                write_cache(payload)
                return payload
            errors.append(f"{endpoint}: 没有返回世界杯场次")
        except HTTPError as error:
            errors.append(f"{endpoint}: HTTP {error.code}")
        except (URLError, TimeoutError, json.JSONDecodeError) as error:
            errors.append(f"{endpoint}: {error}")

    if cached_matches:
        warning = "；".join(errors) or "实时接口不可用，已使用本地缓存赛程。"
        return build_payload(merge_schedule_and_odds(cached_matches, sporttery_matches), "cache", "worldcup_matches_cache.json", warning)

    return {
        "success": False,
        "source": "sporttery",
        "error": "；".join(errors) or "未获取到世界杯赛程。",
        "matches": [],
    }


def write_cache(payload: dict):
    try:
        CACHE_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError:
        pass


def cache_or_error(error_payload: dict) -> dict:
    if not CACHE_PATH.exists():
        return error_payload
    try:
        payload = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return error_payload
    if payload.get("matches"):
        payload["success"] = True
        payload["cache"] = True
        payload["warning"] = error_payload.get("error") or "实时接口不可用，已使用本地缓存赛程。"
        return payload
    return error_payload


class AppHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/worldcup/matches":
            self.respond_json(fetch_worldcup_matches())
            return
        super().do_GET()

    def respond_json(self, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description="World Cup 2026 betting ledger server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8124, type=int)
    args = parser.parse_args()

    handler = partial(AppHandler, directory=str(ROOT))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"World Cup ledger running at http://{args.host}:{args.port}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
