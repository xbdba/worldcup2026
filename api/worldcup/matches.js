const fs = require("fs");
const path = require("path");
const https = require("https");

const API_BASE = "https://api.football-data.org/v4";
const SPORTTERY_CALCULATOR_URL = "https://webapi.sporttery.cn/gateway/uniform/football/getMatchCalculatorV1.qry?channel=c";
const CACHE_PATH = path.join(process.cwd(), "worldcup_matches_cache.json");
const WORLD_CUP_ENDPOINTS = [
  "competitions/WC/matches?season=2026",
  "matches?competitions=WC&dateFrom=2026-06-01&dateTo=2026-07-31",
];

const HAD_OPTIONS = [
  ["h", "主胜"],
  ["d", "平"],
  ["a", "客胜"],
];

const CRS_OPTIONS = [
  { key: "0100", label: "1:0", group: "胜", aliases: ["s01s00"] },
  { key: "0200", label: "2:0", group: "胜", aliases: ["s02s00"] },
  { key: "0201", label: "2:1", group: "胜", aliases: ["s02s01"] },
  { key: "0300", label: "3:0", group: "胜", aliases: ["s03s00"] },
  { key: "0301", label: "3:1", group: "胜", aliases: ["s03s01"] },
  { key: "0302", label: "3:2", group: "胜", aliases: ["s03s02"] },
  { key: "0400", label: "4:0", group: "胜", aliases: ["s04s00"] },
  { key: "0401", label: "4:1", group: "胜", aliases: ["s04s01"] },
  { key: "0402", label: "4:2", group: "胜", aliases: ["s04s02"] },
  { key: "0500", label: "5:0", group: "胜", aliases: ["s05s00"] },
  { key: "0501", label: "5:1", group: "胜", aliases: ["s05s01"] },
  { key: "0502", label: "5:2", group: "胜", aliases: ["s05s02"] },
  { key: "-1-h", label: "胜其他", group: "胜", aliases: ["h", "s-1sh", "winOther", "otherH", "胜其他", "胜其它"] },
  { key: "0000", label: "0:0", group: "平", aliases: ["s00s00"] },
  { key: "0101", label: "1:1", group: "平", aliases: ["s01s01"] },
  { key: "0202", label: "2:2", group: "平", aliases: ["s02s02"] },
  { key: "0303", label: "3:3", group: "平", aliases: ["s03s03"] },
  { key: "-1-d", label: "平其他", group: "平", aliases: ["d", "s-1sd", "drawOther", "otherD", "平其他", "平其它"] },
  { key: "0001", label: "0:1", group: "负", aliases: ["s00s01"] },
  { key: "0002", label: "0:2", group: "负", aliases: ["s00s02"] },
  { key: "0102", label: "1:2", group: "负", aliases: ["s01s02"] },
  { key: "0003", label: "0:3", group: "负", aliases: ["s00s03"] },
  { key: "0103", label: "1:3", group: "负", aliases: ["s01s03"] },
  { key: "0203", label: "2:3", group: "负", aliases: ["s02s03"] },
  { key: "0004", label: "0:4", group: "负", aliases: ["s00s04"] },
  { key: "0104", label: "1:4", group: "负", aliases: ["s01s04"] },
  { key: "0204", label: "2:4", group: "负", aliases: ["s02s04"] },
  { key: "0005", label: "0:5", group: "负", aliases: ["s00s05"] },
  { key: "0105", label: "1:5", group: "负", aliases: ["s01s05"] },
  { key: "0205", label: "2:5", group: "负", aliases: ["s02s05"] },
  { key: "-1-a", label: "负其他", group: "负", aliases: ["a", "s-1sa", "loseOther", "otherA", "负其他", "负其它"] },
];

const TEAM_NAME_ZH = {
  Algeria: "阿尔及利亚",
  Argentina: "阿根廷",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Belgium: "比利时",
  "Bosnia-H.": "波黑",
  "Bosnia-Herzegovina": "波黑",
  Brazil: "巴西",
  Canada: "加拿大",
  "Cape Verde": "佛得角",
  "Cape Verde Islands": "佛得角",
  Colombia: "哥伦比亚",
  "Congo DR": "民主刚果",
  "刚果金": "民主刚果",
  "刚果(金)": "民主刚果",
  Croatia: "克罗地亚",
  "Curaçao": "库拉索",
  Czechia: "捷克",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  England: "英格兰",
  France: "法国",
  Germany: "德国",
  Ghana: "加纳",
  Haiti: "海地",
  Iran: "伊朗",
  Iraq: "伊拉克",
  "Ivory Coast": "科特迪瓦",
  Japan: "日本",
  Jordan: "约旦",
  "Korea Republic": "韩国",
  Mexico: "墨西哥",
  Morocco: "摩洛哥",
  Netherlands: "荷兰",
  "New Zealand": "新西兰",
  Norway: "挪威",
  Panama: "巴拿马",
  Paraguay: "巴拉圭",
  Portugal: "葡萄牙",
  Qatar: "卡塔尔",
  "Saudi Arabia": "沙特阿拉伯",
  Scotland: "苏格兰",
  Senegal: "塞内加尔",
  "South Africa": "南非",
  "South Korea": "韩国",
  Spain: "西班牙",
  Sweden: "瑞典",
  Switzerland: "瑞士",
  Tunisia: "突尼斯",
  Turkey: "土耳其",
  USA: "美国",
  "United States": "美国",
  Uruguay: "乌拉圭",
  Uzbekistan: "乌兹别克斯坦",
  TBD: "待定",
  TBA: "待定",
};

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function requestJson(url, headers = {}, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error("接口返回内容不是 JSON"));
        }
      });
    });

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error("请求超时"));
    });
    request.on("error", reject);
  });
}

function pickOdds(source, options) {
  if (!source || typeof source !== "object") return [];
  return options
    .map((definition) => {
      const option = Array.isArray(definition) ? { key: definition[0], label: definition[1] } : definition;
      const keys = [option.key, ...(option.aliases || [])];
      const raw = keys.map((key) => source[key]).find((value) => value !== undefined && value !== null && value !== "");
      return {
        key: option.key,
        label: option.label,
        group: option.group || "",
        odds: toNumber(raw),
      };
    })
    .filter((option) => option.odds > 0);
}

function joinDateTime(date, time) {
  return [date, time].filter(Boolean).join(" ").trim();
}

function localizeTeam(name) {
  const value = String(name || "").trim();
  if (!value) return "待定";
  return TEAM_NAME_ZH[value] || value;
}

function normalizeSporttery(payload) {
  const value = payload && (payload.value || payload);
  const days = value && Array.isArray(value.matchInfoList) ? value.matchInfoList : [];
  const matches = [];

  days.forEach((day) => {
    (day.subMatchList || []).forEach((item) => {
      const leagueText = `${item.leagueAbbName || ""} ${item.leagueAllName || ""}`;
      if (!/世界杯|World Cup|FIFA World Cup|\bWC\b/i.test(leagueText)) return;

      const match = {
        id: `sp-${item.matchId || item.matchNumStr}`,
        matchNum: item.matchNumStr || String(item.matchNum || ""),
        matchNumDate: item.matchNumDate || "",
        league: "世界杯",
        leagueFull: item.leagueAllName || item.leagueAbbName || "FIFA World Cup",
        competitionCode: "WC",
        source: "sporttery",
        sourceLabel: "中国体彩",
        date: item.matchDate || day.businessDate || "",
        time: String(item.matchTime || "").slice(0, 5),
        businessDate: item.businessDate || day.businessDate || "",
        home: localizeTeam(item.homeTeamAbbName || item.homeTeamAllName || ""),
        away: localizeTeam(item.awayTeamAbbName || item.awayTeamAllName || ""),
        homeFull: localizeTeam(item.homeTeamAllName || item.homeTeamAbbName || ""),
        awayFull: localizeTeam(item.awayTeamAllName || item.awayTeamAbbName || ""),
        homeRank: item.homeTeamGroup || item.homeTeamRank || "",
        awayRank: item.awayTeamGroup || item.awayTeamRank || "",
        status: item.matchStatus || "未开赛",
        stage: item.matchWeek || "",
        oddsUpdatedAt: value.lastUpdateTime || "",
        markets: {},
        result: null,
      };

      if (item.had) {
        match.markets.had = {
          label: "胜平负",
          goalLine: "",
          options: pickOdds(item.had, HAD_OPTIONS),
          updatedAt: joinDateTime(item.had.updateDate, item.had.updateTime),
        };
      }
      if (item.hhad) {
        const goalLine = item.hhad.goalLine || item.hhad.goalLineValue || "";
        match.markets.hhad = {
          label: `让球胜平负${goalLine ? ` (${goalLine})` : ""}`,
          goalLine,
          options: pickOdds(item.hhad, HAD_OPTIONS),
          updatedAt: joinDateTime(item.hhad.updateDate, item.hhad.updateTime),
        };
      }
      if (item.crs) {
        match.markets.crs = {
          label: "比分",
          goalLine: "",
          options: pickOdds(item.crs, CRS_OPTIONS),
          updatedAt: joinDateTime(item.crs.updateDate, item.crs.updateTime),
        };
      }

      matches.push(match);
    });
  });

  return matches.sort((a, b) => `${a.businessDate}${a.matchNum}`.localeCompare(`${b.businessDate}${b.matchNum}`));
}

async function fetchSporttery() {
  return requestJson(SPORTTERY_CALCULATOR_URL, {
      Accept: "application/json, text/plain, */*",
      Referer: "https://www.sporttery.cn/",
      "User-Agent": "Mozilla/5.0 WorldCup2026Ledger/1.0",
  });
}

function kickoffParts(utcDate) {
  if (!utcDate) return { date: "", time: "" };
  const parsed = new Date(utcDate);
  if (Number.isNaN(parsed.getTime())) {
    return {
      date: String(utcDate).slice(0, 10),
      time: String(utcDate).slice(11, 16),
    };
  }
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(parsed),
    time: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: "Asia/Shanghai",
    }).format(parsed),
  };
}

function teamName(team, short = true) {
  if (!team || typeof team !== "object") return "待定";
  const keys = short ? ["shortName", "tla", "name"] : ["name", "shortName", "tla"];
  for (const key of keys) {
    const value = String(team[key] || "").trim();
    if (value && !["TBD", "TBA"].includes(value.toUpperCase())) return value;
  }
  return "待定";
}

function resultFromScore(score) {
  const fullTime = score && score.fullTime ? score.fullTime : {};
  if (fullTime.home === null || fullTime.home === undefined || fullTime.away === null || fullTime.away === undefined) {
    return null;
  }
  return {
    fullScore: `${fullTime.home}:${fullTime.away}`,
    halfScore: "",
    status: score.winner || "",
  };
}

function normalizeFootballData(rawMatches) {
  return rawMatches
    .sort((a, b) => `${a.utcDate || ""}${a.id || ""}`.localeCompare(`${b.utcDate || ""}${b.id || ""}`))
    .map((item, index) => {
      const competition = item.competition || {};
      const kickoff = kickoffParts(item.utcDate || "");
      return {
        id: `fd-${item.id}`,
        matchNum: `WC${String(index + 1).padStart(3, "0")}`,
        matchNumDate: kickoff.date.replace(/-/g, ""),
        league: "世界杯",
        leagueFull: competition.name || "FIFA World Cup",
        competitionCode: competition.code || "WC",
        source: "football-data",
        sourceLabel: "Football-Data",
        date: kickoff.date,
        time: kickoff.time,
        businessDate: kickoff.date,
        utcDate: item.utcDate || "",
        home: localizeTeam(teamName(item.homeTeam)),
        away: localizeTeam(teamName(item.awayTeam)),
        homeFull: localizeTeam(teamName(item.homeTeam, false)),
        awayFull: localizeTeam(teamName(item.awayTeam, false)),
        status: item.status || "",
        stage: item.stage || item.group || "",
        matchday: item.matchday || "",
        oddsUpdatedAt: "",
        markets: {},
        result: resultFromScore(item.score || {}),
      };
    });
}

function readCacheMatches() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return [];
    const payload = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    return normalizeCachedMatches(payload.matches || []);
  } catch (error) {
    return [];
  }
}

function normalizeCachedMatches(matches) {
  return (Array.isArray(matches) ? matches : [])
    .filter((match) => match && typeof match === "object")
    .filter((match) => {
      const leagueText = `${match.league || ""} ${match.leagueFull || ""} ${match.competitionCode || ""}`;
      if (match.source === "sporttery") return /世界杯|World Cup|FIFA World Cup|\bWC\b/i.test(leagueText);
      return match.competitionCode === "WC" || /世界杯|World Cup|FIFA World Cup|\bWC\b/i.test(leagueText);
    })
    .map((match) => ({
      ...match,
      league: "世界杯",
      leagueFull: match.leagueFull || "FIFA World Cup",
      competitionCode: "WC",
      businessDate: match.businessDate || match.date || "",
      home: localizeTeam(match.home),
      away: localizeTeam(match.away),
      homeFull: localizeTeam(match.homeFull || match.home),
      awayFull: localizeTeam(match.awayFull || match.away),
      markets: match.markets || {},
      result: match.result || null,
    }))
    .sort((a, b) => `${a.date || a.businessDate || ""}${a.time || ""}${a.matchNum || ""}`.localeCompare(`${b.date || b.businessDate || ""}${b.time || ""}${b.matchNum || ""}`));
}

async function fetchFootballData(endpoint, apiKey) {
  return requestJson(`${API_BASE}/${endpoint}`, {
      Accept: "application/json",
      "X-Auth-Token": apiKey,
  });
}

function hasOdds(match) {
  return Object.values(match.markets || {}).some((market) => Array.isArray(market.options) && market.options.length);
}

function teamKey(value) {
  return localizeTeam(value).toLowerCase().replace(/\s+/g, "");
}

function matchKey(match) {
  const date = match.date || match.businessDate || "";
  const home = teamKey(match.homeFull || match.home);
  const away = teamKey(match.awayFull || match.away);
  if (date && home && away && ![home, away].includes("待定")) return `${date}|${home}-${away}`;
  return String(match.id || match.matchNum || `${date}|${home}-${away}`);
}

function mergeScheduleAndOdds(scheduleMatches, oddsMatches) {
  const byKey = new Map();
  scheduleMatches.forEach((match) => {
    byKey.set(matchKey(match), match);
  });

  oddsMatches.forEach((odds) => {
    const key = matchKey(odds);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, odds);
      return;
    }
    byKey.set(key, {
      ...existing,
      source: hasOdds(odds) ? "sporttery" : existing.source || odds.source,
      sourceLabel: hasOdds(odds) ? "中国体彩" : existing.sourceLabel || odds.sourceLabel,
      status: odds.status || existing.status,
      oddsUpdatedAt: odds.oddsUpdatedAt || existing.oddsUpdatedAt || "",
      markets: hasOdds(odds) ? odds.markets : existing.markets || {},
      result: existing.result || odds.result,
    });
  });

  return [...byKey.values()].sort((a, b) => `${a.date || a.businessDate || ""}${a.time || ""}${a.matchNum || ""}`.localeCompare(`${b.date || b.businessDate || ""}${b.time || ""}${b.matchNum || ""}`));
}

function createOddsSummary(matches, oddsMatches) {
  const rows = Array.isArray(matches) ? matches : [];
  const withOdds = rows.filter(hasOdds);
  return {
    totalMatches: rows.length,
    sportteryReturnedMatches: Array.isArray(oddsMatches) ? oddsMatches.length : 0,
    matchesWithOdds: withOdds.length,
    matchesWithoutOdds: Math.max(0, rows.length - withOdds.length),
    oddsMatchNums: withOdds.map((match) => match.matchNum).filter(Boolean),
  };
}

module.exports = async function handler(request, response) {
  const errors = [];
  let sportteryMatches = [];
  const cachedMatches = readCacheMatches();

  try {
    const sportteryPayload = await fetchSporttery();
    sportteryMatches = normalizeSporttery(sportteryPayload);
    if (!sportteryMatches.length) errors.push("sporttery: 没有返回世界杯场次");
  } catch (error) {
    errors.push(`sporttery: ${error.message}`);
  }

  if (cachedMatches.length) {
    const merged = mergeScheduleAndOdds(cachedMatches, sportteryMatches);
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    response.status(200).json({
      success: true,
      source: sportteryMatches.length ? "cache+sporttery" : "cache",
      endpoint: sportteryMatches.length ? "worldcup_matches_cache.json+sporttery:getMatchCalculatorV1" : "worldcup_matches_cache.json",
      competition: "WC",
      season: "2026",
      generatedAt: new Date().toISOString(),
      warning: sportteryMatches.length ? "" : errors.join("；"),
      oddsSummary: createOddsSummary(merged, sportteryMatches),
      matches: merged,
    });
    return;
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (apiKey) {
    for (const endpoint of WORLD_CUP_ENDPOINTS) {
      try {
        const payload = await fetchFootballData(endpoint, apiKey);
        const matches = (payload.matches || []).filter((item) => {
          const competition = item.competition || {};
          return competition.code === "WC" || String(competition.name || "").includes("World Cup");
        });
        if (matches.length) {
          const schedule = normalizeFootballData(matches);
          const merged = mergeScheduleAndOdds(schedule, sportteryMatches);
          response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
          response.status(200).json({
            success: true,
            source: sportteryMatches.length ? "football-data+sporttery" : "football-data",
            endpoint,
            competition: "WC",
            season: "2026",
            generatedAt: new Date().toISOString(),
            oddsSummary: createOddsSummary(merged, sportteryMatches),
            matches: merged,
          });
          return;
        }
        errors.push(`${endpoint}: 没有返回世界杯场次`);
      } catch (error) {
        errors.push(`${endpoint}: ${error.message}`);
      }
    }
  }

  if (sportteryMatches.length) {
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    response.status(200).json({
      success: true,
      source: "sporttery",
      endpoint: "sporttery:getMatchCalculatorV1",
      competition: "WC",
      season: "2026",
      generatedAt: new Date().toISOString(),
      warning: "未配置全赛程接口，只返回当前已开放赔率的世界杯场次。",
      oddsSummary: createOddsSummary(sportteryMatches, sportteryMatches),
      matches: sportteryMatches,
    });
    return;
  }

  response.status(200).json({
    success: false,
    source: "sporttery",
    error: errors.join("；") || "未获取到世界杯赛程。",
    matches: [],
  });
};
