const API_WORLD_CUP_MATCHES = "/api/worldcup/matches";
const STORE_KEY = "worldcup2026-ledger-v2";
const LEGACY_STORE_KEY = "worldcup2026-ledger-v1";
const WORLD_CUP_COMPETITION_CODE = "WC";

const state = {
  matches: [],
  bets: [],
  plan: {},
  lastSync: "",
};

const els = {};

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
  { key: "-1-h", label: "胜其他", group: "胜", aliases: ["h", "s-1sh", "s-1s0", "winOther", "otherH", "胜其他", "胜其它"] },
  { key: "0000", label: "0:0", group: "平", aliases: ["s00s00"] },
  { key: "0101", label: "1:1", group: "平", aliases: ["s01s01"] },
  { key: "0202", label: "2:2", group: "平", aliases: ["s02s02"] },
  { key: "0303", label: "3:3", group: "平", aliases: ["s03s03"] },
  { key: "-1-d", label: "平其他", group: "平", aliases: ["d", "s-1sd", "s-1s1", "drawOther", "otherD", "平其他", "平其它"] },
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
  { key: "-1-a", label: "负其他", group: "负", aliases: ["a", "s-1sa", "s-1s2", "loseOther", "otherA", "负其他", "负其它"] },
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
  待定: "待定",
};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  loadState();
  bindEvents();
  setDefaultDates();
  render();
  syncMatches();
});

function bindElements() {
  [
    "syncMatchesBtn",
    "syncResultsBtn",
    "exportBtn",
    "importFile",
    "netProfit",
    "roiText",
    "totalStake",
    "ticketCount",
    "totalReturn",
    "hitRate",
    "todayProfit",
    "lastSync",
    "matchSearch",
    "dateFilter",
    "syncNotice",
    "matchList",
    "planList",
    "planEmpty",
    "planSummary",
    "planStake",
    "planPassType",
    "planDate",
    "savePlanBtn",
    "clearPlanBtn",
    "statusFilter",
    "clearSettledBtn",
    "ledgerBody",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.syncMatchesBtn.addEventListener("click", syncMatches);
  els.syncResultsBtn.addEventListener("click", syncResults);
  els.exportBtn.addEventListener("click", exportState);
  els.importFile.addEventListener("change", importState);
  els.matchSearch.addEventListener("input", renderMatches);
  els.dateFilter.addEventListener("change", renderMatches);
  els.statusFilter.addEventListener("change", renderLedger);
  els.clearSettledBtn.addEventListener("click", () => {
    els.statusFilter.value = "pending";
    renderLedger();
  });
  els.clearPlanBtn.addEventListener("click", clearPlan);
  els.savePlanBtn.addEventListener("click", savePlan);
  els.planStake.addEventListener("input", () => {
    normalizeStakeInput();
    renderPlan();
  });
  els.planPassType.addEventListener("change", renderPlan);
  els.planDate.addEventListener("change", renderPlan);
}

function setDefaultDates() {
  const today = todayIso();
  if (!els.planDate.value) els.planDate.value = today;
}

function loadState() {
  const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_STORE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.matches = Array.isArray(parsed.matches) ? parsed.matches.filter(isWorldCupMatch).map(normalizeStoredMatch) : [];
    state.bets = Array.isArray(parsed.bets) ? parsed.bets.map(normalizeStoredBet) : [];
    state.plan = parsed.plan && typeof parsed.plan === "object" ? parsed.plan : {};
    state.lastSync = parsed.lastSync || "";
  } catch (error) {
    showNotice("本地数据读取失败，已保留当前空台账。", "warn");
  }
}

function persist() {
  localStorage.setItem(
    STORE_KEY,
    JSON.stringify({
      matches: state.matches,
      bets: state.bets,
      plan: state.plan,
      lastSync: state.lastSync,
    })
  );
}

async function syncMatches() {
  showNotice("正在同步世界杯完整赛程，并合并已开放的体彩赔率...");
  try {
    const matches = await fetchWorldCupMatches();
    replaceWorldCupSchedule(matches);
    cleanupPlan();
    state.lastSync = new Date().toLocaleString("zh-CN", { hour12: false });
    persist();
    const oddsCount = state.matches.filter(hasMatchOdds).length;
    showNotice(`已同步 ${state.matches.length} 场世界杯赛程；其中 ${oddsCount} 场已有体彩赔率。`, "ok");
    render();
  } catch (error) {
    showNotice(`赛程同步失败：${error.message}。已保留本地已有数据。`, "warn");
    render();
  }
}

async function syncResults() {
  showNotice("正在同步世界杯赛果...");
  try {
    const matches = await fetchWorldCupMatches();
    replaceWorldCupSchedule(matches);
    const results = normalizeResults(matches);
    if (!results.length) throw new Error("没有获取到可结算赛果");
    applyResults(results);
    state.lastSync = new Date().toLocaleString("zh-CN", { hour12: false });
    persist();
    showNotice(`已同步 ${results.length} 条赛果，并重新计算投注记录。`, "ok");
    render();
  } catch (error) {
    showNotice(`赛果同步失败：${error.message}。可在投注记录里手动录入比分。`, "warn");
  }
}

async function fetchWorldCupMatches() {
  const data = await fetchJson(API_WORLD_CUP_MATCHES);
  if (data && data.success === false && !Array.isArray(data.matches)) {
    throw new Error(data.error || "接口没有返回可用比赛");
  }
  const matches = normalizeWorldCupPayload(data).filter(isWorldCupMatch);
  if (!matches.length) throw new Error("没有返回世界杯比赛");
  return matches;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });
  if (!response.ok) throw new Error(`请求返回 ${response.status}`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("返回内容不是 JSON");
  }
}

function normalizeWorldCupPayload(payload) {
  const value = payload && (payload.value || payload);
  if (value && Array.isArray(value.matchInfoList)) return normalizeSportteryMatches(payload);
  return normalizeApiMatches(payload);
}

function normalizeSportteryMatches(payload) {
  const value = payload && (payload.value || payload);
  const days = value && Array.isArray(value.matchInfoList) ? value.matchInfoList : [];
  const matches = [];

  days.forEach((day) => {
    (day.subMatchList || []).forEach((item) => {
      const leagueText = `${item.leagueAbbName || ""} ${item.leagueAllName || ""}`;
      if (!isWorldCupLeague(leagueText)) return;

      const match = {
        id: `sp-${item.matchId || item.matchNumStr || item.matchNum || ""}`,
        matchNum: item.matchNumStr || String(item.matchNum || ""),
        matchNumDate: item.matchNumDate || "",
        league: "世界杯",
        leagueFull: item.leagueAllName || "FIFA World Cup",
        competitionCode: WORLD_CUP_COMPETITION_CODE,
        source: "sporttery",
        sourceLabel: "中国体彩",
        date: item.matchDate || day.businessDate || "",
        time: String(item.matchTime || "").slice(0, 5),
        businessDate: item.businessDate || day.businessDate || item.matchDate || "",
        home: localizeTeam(item.homeTeamAbbName || item.homeTeamAllName),
        away: localizeTeam(item.awayTeamAbbName || item.awayTeamAllName),
        homeFull: localizeTeam(item.homeTeamAllName || item.homeTeamAbbName),
        awayFull: localizeTeam(item.awayTeamAllName || item.awayTeamAbbName),
        homeRank: item.homeTeamGroup || item.homeTeamRank || "",
        awayRank: item.awayTeamGroup || item.awayTeamRank || "",
        status: item.matchStatus || "",
        stage: item.groupName || item.matchWeek || "",
        oddsUpdatedAt: value.lastUpdateTime || "",
        markets: {},
        result: null,
      };

      addHadMarket(match, "had", item.had, "胜平负", "0");
      addHadMarket(match, "hhad", item.hhad, "让球胜平负", item.hhad && (item.hhad.goalLine || item.hhad.goalLineValue || ""));
      addScoreMarket(match, item.crs);

      matches.push(match);
    });
  });

  return matches;
}

function normalizeApiMatches(payload) {
  const value = payload && (payload.value || payload);
  const rawMatches = Array.isArray(value) ? value : value && Array.isArray(value.matches) ? value.matches : [];
  return rawMatches.map((item, index) => normalizeApiMatch(item, index)).filter(Boolean);
}

function normalizeApiMatch(item, index) {
  if (!item || typeof item !== "object") return null;

  if (item.matchNum || item.markets || item.home || item.away) {
    const match = {
      ...item,
      id: String(item.id || `wc-${index + 1}`),
      matchNum: item.matchNum || `WC${String(index + 1).padStart(3, "0")}`,
      league: "世界杯",
      leagueFull: item.leagueFull || "FIFA World Cup",
      competitionCode: item.competitionCode || WORLD_CUP_COMPETITION_CODE,
      source: item.source || "worldcup",
      sourceLabel: item.sourceLabel || "世界杯赛程",
      businessDate: item.businessDate || item.date || "",
      home: localizeTeam(item.home),
      away: localizeTeam(item.away),
      homeFull: localizeTeam(item.homeFull || item.home),
      awayFull: localizeTeam(item.awayFull || item.away),
      markets: item.markets || {},
      result: item.result || null,
    };
    return normalizeStoredMatch(match);
  }

  const competition = item.competition || {};
  const kickoff = parseKickoff(item.utcDate);
  const score = item.score && item.score.fullTime;
  const fullScore = score && score.home !== null && score.home !== undefined && score.away !== null && score.away !== undefined
    ? `${score.home}:${score.away}`
    : "";

  return {
    id: `fd-${item.id || index + 1}`,
    matchNum: `WC${String(index + 1).padStart(3, "0")}`,
    matchNumDate: kickoff.date.replace(/-/g, ""),
    league: "世界杯",
    leagueFull: competition.name || "FIFA World Cup",
    competitionCode: competition.code || WORLD_CUP_COMPETITION_CODE,
    source: "football-data",
    sourceLabel: "世界杯赛程",
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
    result: fullScore ? { fullScore, status: item.status || "" } : null,
  };
}

function normalizeStoredMatch(match) {
  const normalized = {
    ...match,
    id: String(match.id || match.matchId || match.matchNum || ""),
    matchNum: match.matchNum || "",
    league: "世界杯",
    leagueFull: match.leagueFull || "FIFA World Cup",
    competitionCode: match.competitionCode || WORLD_CUP_COMPETITION_CODE,
    source: match.source || "worldcup",
    sourceLabel: match.sourceLabel || "世界杯赛程",
    date: match.date || match.businessDate || "",
    time: String(match.time || "").slice(0, 5),
    businessDate: match.businessDate || match.date || "",
    home: localizeTeam(match.home),
    away: localizeTeam(match.away),
    homeFull: localizeTeam(match.homeFull || match.home),
    awayFull: localizeTeam(match.awayFull || match.away),
    status: match.status || "",
    stage: match.stage || "",
    oddsUpdatedAt: match.oddsUpdatedAt || "",
    markets: normalizeMarkets(match.markets || {}),
    result: match.result || null,
  };
  normalized.id = normalized.id || stableMatchKey(normalized);
  return normalized;
}

function normalizeStoredBet(bet) {
  const selections = Array.isArray(bet.selections) ? bet.selections : [];
  if (selections.length) {
    return {
      ...bet,
      id: String(bet.id || createId()),
      betDate: bet.betDate || todayIso(),
      stake: toNumber(bet.stake),
      returnAmount: toNumber(bet.returnAmount),
      profit: toNumber(bet.profit),
      status: bet.status || "pending",
      selections: selections.map(normalizeSelection),
    };
  }

  const selection = normalizeSelection({
    matchId: bet.matchId || "",
    matchNum: bet.matchNum || "",
    matchLabel: bet.matchLabel || bet.matchNum || "手动场次",
    market: bet.market || "custom",
    marketLabel: marketName(bet.market),
    pick: bet.pick || "",
    odds: bet.odds,
    handicap: "",
    result: bet.result || "",
    status: bet.status || "pending",
    note: bet.note || "",
  });

  return {
    ...bet,
    id: String(bet.id || createId()),
    betDate: bet.betDate || todayIso(),
    passType: bet.passType || "单关",
    stake: toNumber(bet.stake),
    returnAmount: toNumber(bet.returnAmount),
    profit: toNumber(bet.profit),
    status: bet.status || "pending",
    selections: [selection],
  };
}

function normalizeSelection(selection) {
  return {
    id: String(selection.id || selection.selectionId || createId()),
    matchId: String(selection.matchId || ""),
    matchNum: selection.matchNum || "",
    matchLabel: selection.matchLabel || selection.label || "手动场次",
    market: selection.market || "custom",
    marketLabel: selection.marketLabel || marketName(selection.market),
    pickKey: selection.pickKey || selection.key || selection.pick || "",
    pick: selection.pick || "",
    odds: toNumber(selection.odds),
    handicap: selection.handicap || "",
    result: selection.result || "",
    status: selection.status || "pending",
    note: selection.note || "",
  };
}

function normalizeMarkets(markets) {
  const normalized = {};
  ["had", "hhad", "crs"].forEach((key) => {
    const market = markets[key];
    if (!market || !Array.isArray(market.options)) return;
    normalized[key] = {
      ...market,
      label: market.label || marketName(key),
      goalLine: market.goalLine ?? "",
      options: market.options
        .map((option) => ({
          key: String(option.key || option.label || ""),
          label: option.label || option.key || "",
          group: option.group || "",
          odds: toNumber(option.odds),
        }))
        .filter((option) => option.label && option.odds > 0),
      updatedAt: market.updatedAt || "",
    };
  });
  return normalized;
}

function addHadMarket(match, key, source, label, goalLine) {
  const options = pickOdds(source || {}, HAD_OPTIONS);
  if (!options.length) return;
  match.markets[key] = {
    label,
    goalLine: goalLine ?? "",
    options,
    updatedAt: joinDateTime(source && source.updateDate, source && source.updateTime),
  };
}

function addScoreMarket(match, source) {
  const options = pickOdds(source || {}, CRS_OPTIONS);
  if (!options.length) return;
  match.markets.crs = {
    label: "比分",
    goalLine: "",
    options,
    updatedAt: joinDateTime(source && source.updateDate, source && source.updateTime),
  };
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
    .filter((option) => option.label && option.odds > 0);
}

function replaceWorldCupSchedule(matches) {
  const incoming = matches.filter(isWorldCupMatch).map(normalizeStoredMatch);
  const existing = state.matches.filter(isWorldCupMatch).map(normalizeStoredMatch);
  const byKey = new Map();

  existing.forEach((match) => {
    byKey.set(stableMatchKey(match), match);
  });

  incoming.forEach((match) => {
    const key = stableMatchKey(match);
    const oldMatch = byKey.get(key) || findMatchByLooseKey([...byKey.values()], match);
    const merged = oldMatch ? mergeMatch(oldMatch, match) : match;
    byKey.set(stableMatchKey(merged), merged);
  });

  state.matches = [...byKey.values()].filter(isWorldCupMatch).sort(compareMatches);
}

function mergeMatch(existing, incoming) {
  const incomingHasOdds = hasMatchOdds(incoming);
  const existingHasOdds = hasMatchOdds(existing);
  return {
    ...existing,
    ...incoming,
    id: existing.source === "sporttery" && incoming.source !== "sporttery" ? existing.id : incoming.id || existing.id,
    matchNum: preferWorldCupMatchNum(existing.matchNum, incoming.matchNum),
    date: incoming.date || existing.date,
    time: incoming.time || existing.time,
    businessDate: incoming.businessDate || existing.businessDate,
    home: incoming.home || existing.home,
    away: incoming.away || existing.away,
    homeFull: incoming.homeFull || existing.homeFull,
    awayFull: incoming.awayFull || existing.awayFull,
    status: incoming.status || existing.status,
    stage: incoming.stage || existing.stage,
    source: incomingHasOdds ? incoming.source : existing.source || incoming.source,
    sourceLabel: incomingHasOdds ? incoming.sourceLabel : existing.sourceLabel || incoming.sourceLabel,
    oddsUpdatedAt: incoming.oddsUpdatedAt || existing.oddsUpdatedAt,
    markets: incomingHasOdds ? incoming.markets : existingHasOdds ? existing.markets : incoming.markets,
    result: incoming.result || existing.result || null,
  };
}

function preferWorldCupMatchNum(existing, incoming) {
  if (/^WC\d{3}$/i.test(String(existing || ""))) return existing;
  if (/^WC\d{3}$/i.test(String(incoming || ""))) return incoming;
  return incoming || existing || "";
}

function compareMatches(a, b) {
  return `${a.date || a.businessDate || ""} ${a.time || ""} ${a.matchNum || ""}`.localeCompare(
    `${b.date || b.businessDate || ""} ${b.time || ""} ${b.matchNum || ""}`,
    "zh-CN"
  );
}

function findMatchByLooseKey(matches, target) {
  const targetDate = target.date || target.businessDate || "";
  const targetTeams = teamPairKey(target);
  return matches.find((match) => {
    const sameDate = (match.date || match.businessDate || "") === targetDate;
    return sameDate && targetTeams && teamPairKey(match) === targetTeams;
  });
}

function stableMatchKey(match) {
  if (/^fd-|^wc-/i.test(String(match.id || ""))) return String(match.id);
  const date = match.date || match.businessDate || "";
  const teams = teamPairKey(match);
  if (date && teams && !teams.includes("待定")) return `${date}|${teams}`;
  return String(match.id || match.matchNum || createId());
}

function teamPairKey(match) {
  const home = normalizeText(match.homeFull || match.home);
  const away = normalizeText(match.awayFull || match.away);
  return home && away ? `${home}-${away}` : "";
}

function normalizeResults(matches) {
  return matches
    .filter((match) => match.result && match.result.fullScore)
    .map((match) => ({
      id: match.id,
      key: stableMatchKey(match),
      matchNum: match.matchNum,
      fullScore: match.result.fullScore,
      halfScore: match.result.halfScore || "",
      status: match.status || "",
    }));
}

function applyResults(results) {
  const byId = new Map(results.filter((result) => result.id).map((result) => [String(result.id), result]));
  const byKey = new Map(results.filter((result) => result.key).map((result) => [result.key, result]));
  const byNum = new Map(results.filter((result) => result.matchNum).map((result) => [normalizeMatchNum(result.matchNum), result]));

  state.matches = state.matches.map((match) => {
    const result = byId.get(String(match.id)) || byKey.get(stableMatchKey(match)) || byNum.get(normalizeMatchNum(match.matchNum));
    return result ? { ...match, result: { fullScore: result.fullScore, halfScore: result.halfScore, status: result.status } } : match;
  });

  state.bets = state.bets.map((bet) => settleBet(applyBetResults(bet)));
}

function applyBetResults(bet) {
  const selections = bet.selections.map((selection) => {
    const match = state.matches.find((item) => item.id === selection.matchId || stableMatchKey(item) === selection.matchId || normalizeMatchNum(item.matchNum) === normalizeMatchNum(selection.matchNum));
    if (!match || !match.result || !match.result.fullScore) return selection;
    return { ...selection, result: match.result.fullScore };
  });
  return { ...bet, selections };
}

function normalizeMatchNum(value) {
  return String(value || "").replace(/\s+/g, "").replace(/星期/g, "周").replace(/周天/g, "周日").toUpperCase();
}

function render() {
  renderDateFilter();
  renderMatches();
  renderPlan();
  renderLedger();
  renderSummary();
}

function renderDateFilter() {
  const current = els.dateFilter.value;
  const dates = [...new Set(getMatchBoardMatches().map((match) => match.businessDate || match.date).filter(Boolean))].sort();
  els.dateFilter.innerHTML = dates
    .map((date) => `<option value="${escapeHtml(date)}">${escapeHtml(formatDateLabel(date))}</option>`)
    .join("");
  els.dateFilter.value = resolveMatchBoardDate(dates, current);
}

function resolveMatchBoardDate(dates, current) {
  if (!dates.length) return "";
  if (dates.includes(current)) return current;
  const today = todayIso();
  if (dates.includes(today)) return today;
  return dates.find((date) => date >= today) || dates[dates.length - 1];
}

function renderMatches() {
  const query = els.matchSearch.value.trim().toLowerCase();
  const date = els.dateFilter.value;
  const matches = getMatchBoardMatches().filter((match) => {
    const haystack = `${match.matchNum} ${match.league} ${match.home} ${match.away} ${match.homeFull} ${match.awayFull} ${stageName(match.stage)} ${stageName(match.status)}`.toLowerCase();
    const dateOk = !date || match.businessDate === date || match.date === date;
    return dateOk && (!query || haystack.includes(query));
  });

  if (!matches.length) {
    els.matchList.innerHTML = getEmptyState(date ? "当天没有世界杯场次" : "还没有世界杯赛程", "同步后可查看 2026 世界杯全部比赛日期。");
    return;
  }

  els.matchList.innerHTML = matches.map(renderMatchCard).join("");
  els.matchList.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(JSON.parse(button.dataset.select)));
  });
  els.matchList.querySelectorAll("[data-market-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".match-card");
      card.querySelectorAll("[data-market-tab]").forEach((item) => item.classList.toggle("is-active", item === button));
      card.querySelectorAll("[data-market-panel]").forEach((panel) => panel.hidden = panel.dataset.marketPanel !== button.dataset.marketTab);
    });
  });
}

function getMatchBoardMatches() {
  return state.matches.filter(isWorldCupMatch);
}

function hasMatchOdds(match) {
  return Object.values(match.markets || {}).some((market) => Array.isArray(market.options) && market.options.length);
}

function isWorldCupMatch(match) {
  if (!match || typeof match !== "object") return false;
  const leagueText = `${match.league || ""} ${match.leagueFull || ""}`;
  if (match.source === "sporttery") return isWorldCupLeague(leagueText);
  return match.competitionCode === WORLD_CUP_COMPETITION_CODE || isWorldCupLeague(leagueText);
}

function isWorldCupLeague(text) {
  return /世界杯|World Cup|FIFA World Cup|\bWC\b/i.test(String(text || ""));
}

function renderMatchCard(match) {
  const markets = match.markets || {};
  const availableMarkets = [
    markets.had ? ["had", markets.had] : null,
    markets.hhad ? ["hhad", markets.hhad] : null,
    markets.crs ? ["crs", markets.crs] : null,
  ].filter(Boolean);
  const activeMarket = availableMarkets[0] && availableMarkets[0][0];
  const noOdds = !availableMarkets.length;
  const selectedCount = countMatchSelections(match.id);

  return `
    <article class="match-card${selectedCount ? " has-selection" : ""}">
      <div class="match-meta">
        <div class="match-code">${escapeHtml(match.matchNum || "--")}</div>
        <div class="league-chip">世界杯</div>
        <div class="match-time">${escapeHtml(kickoffLabel(match))}</div>
      </div>
      <div class="match-main">
        <div class="match-line">
          <div>
            <div class="match-teams">${teamRank(match.homeRank)}${escapeHtml(match.home || "待定")} <span>VS</span> ${escapeHtml(match.away || "待定")}${teamRank(match.awayRank)}</div>
            <div class="match-sub">
              ${escapeHtml(stageName(match.stage || match.status || "未开赛"))}
              ${match.result ? ` · 比分 ${escapeHtml(match.result.fullScore || "--")}` : ""}
              ${match.oddsUpdatedAt ? ` · 赔率 ${escapeHtml(match.oddsUpdatedAt)}` : ""}
            </div>
          </div>
          <div class="selected-badge">${selectedCount ? `${selectedCount} 项已选` : noOdds ? "赔率待更新" : "可选"}</div>
        </div>
        ${noOdds ? renderNoOdds(match) : renderMarketTabs(match, availableMarkets, activeMarket)}
      </div>
    </article>
  `;
}

function renderNoOdds(match) {
  return `
    <div class="no-odds-row">
      <span>该场暂未开放体彩赔率，赛程已保留，赔率更新后会自动合并。</span>
      <button class="secondary-pick" data-select="${escapeHtml(JSON.stringify(createManualSelectionPayload(match)))}" type="button">手动录入</button>
    </div>
  `;
}

function renderMarketTabs(match, availableMarkets, activeMarket) {
  return `
    <div class="market-tabs" role="tablist" aria-label="玩法选择">
      ${availableMarkets.map(([key, market]) => `
        <button class="market-tab${key === activeMarket ? " is-active" : ""}" data-market-tab="${escapeHtml(key)}" type="button">
          ${escapeHtml(marketTabLabel(key, market))}
        </button>
      `).join("")}
    </div>
    <div class="market-panels">
      ${availableMarkets.map(([key, market]) => `
        <div class="market-panel" data-market-panel="${escapeHtml(key)}"${key === activeMarket ? "" : " hidden"}>
          ${key === "crs" ? renderScoreMarket(match, key, market) : renderHadMarket(match, key, market)}
        </div>
      `).join("")}
    </div>
  `;
}

function renderHadMarket(match, marketKey, market) {
  return `
    <div class="pick-grid three">
      ${market.options.map((option) => renderOddButton(match, marketKey, market, option)).join("")}
    </div>
  `;
}

function renderScoreMarket(match, marketKey, market) {
  const groups = ["胜", "平", "负"];
  return `
    <div class="score-groups">
      ${groups.map((group) => {
        const options = market.options.filter((option) => option.group === group);
        if (!options.length) return "";
        return `
          <section class="score-group">
            <div class="score-group-title">${escapeHtml(group)}</div>
            <div class="score-picks">
              ${options.map((option) => renderOddButton(match, marketKey, market, option)).join("")}
            </div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function renderOddButton(match, marketKey, market, option) {
  const payload = createSelectionPayload(match, marketKey, market, option);
  const selected = isSelected(payload.selectionId);
  return `
    <button class="odd-pick${selected ? " is-selected" : ""}" data-select="${escapeHtml(JSON.stringify(payload))}" type="button">
      <b>${escapeHtml(option.label)}</b>
      <span>${formatOdds(option.odds)}</span>
    </button>
  `;
}

function createSelectionPayload(match, marketKey, market, option) {
  const handicap = marketKey === "hhad" ? String(market.goalLine ?? "") : "";
  const selectionId = buildSelectionId(match.id, marketKey, option.key || option.label);
  return {
    selectionId,
    matchId: match.id,
    matchNum: match.matchNum,
    matchLabel: `${match.matchNum || ""} ${match.home || "待定"} VS ${match.away || "待定"}`.trim(),
    market: marketKey,
    marketLabel: marketName(marketKey),
    pickKey: option.key || option.label,
    pick: option.label,
    odds: option.odds,
    handicap,
    note: handicap ? `让球 ${handicap}` : "",
  };
}

function createManualSelectionPayload(match) {
  return {
    selectionId: buildSelectionId(match.id, "custom", "manual"),
    matchId: match.id,
    matchNum: match.matchNum,
    matchLabel: `${match.matchNum || ""} ${match.home || "待定"} VS ${match.away || "待定"}`.trim(),
    market: "custom",
    marketLabel: "手动录入",
    pickKey: "manual",
    pick: "待录入",
    odds: 0,
    handicap: "",
    note: "赔率待更新",
  };
}

function buildSelectionId(matchId, market, pickKey) {
  return `${matchId}::${market}::${pickKey}`;
}

function toggleSelection(payload) {
  const selection = normalizeSelection(payload);
  if (state.plan[selection.id]) {
    delete state.plan[selection.id];
  } else {
    state.plan[selection.id] = selection;
  }
  persist();
  renderMatches();
  renderPlan();
}

function countMatchSelections(matchId) {
  return getPlanSelections().filter((selection) => selection.matchId === matchId).length;
}

function isSelected(selectionId) {
  return Boolean(state.plan[selectionId]);
}

function getPlanSelections() {
  return Object.values(state.plan).map(normalizeSelection).sort((a, b) => `${a.matchNum}${a.market}${a.pick}`.localeCompare(`${b.matchNum}${b.market}${b.pick}`, "zh-CN"));
}

function cleanupPlan() {
  const validMatchIds = new Set(state.matches.map((match) => match.id));
  const validMatchNums = new Set(state.matches.map((match) => normalizeMatchNum(match.matchNum)).filter(Boolean));
  Object.keys(state.plan).forEach((key) => {
    const selection = state.plan[key];
    if (!validMatchIds.has(selection.matchId) && !validMatchNums.has(normalizeMatchNum(selection.matchNum))) delete state.plan[key];
  });
}

function clearPlan() {
  state.plan = {};
  els.planPassType.value = "单关";
  persist();
  renderMatches();
  renderPlan();
}

function renderPlan() {
  const selections = getPlanSelections();
  updatePlanPassType(selections);
  const stake = toNumber(els.planStake.value);
  const units = countPlanUnits(selections);
  const minStake = units * 2;
  const estimate = estimateMaxReturn(selections, stake);

  els.planEmpty.hidden = selections.length > 0;
  els.planList.hidden = selections.length === 0;
  els.savePlanBtn.disabled = selections.length === 0 || stake <= 0;

  els.planList.innerHTML = selections.map(renderPlanItem).join("");
  els.planSummary.textContent = selections.length
    ? `${selections.length} 项选择 · ${units} 注 · 最低 ${money(minStake)} · 预计最高返还 ${estimate ? money(estimate) : "待赔率"}`
    : "未选择比赛";

  els.planList.querySelectorAll("[data-remove-selection]").forEach((button) => {
    button.addEventListener("click", () => {
      delete state.plan[button.dataset.removeSelection];
      persist();
      renderMatches();
      renderPlan();
    });
  });
}

function renderPlanItem(selection) {
  const oddsText = selection.odds > 0 ? formatOdds(selection.odds) : "待填";
  return `
    <article class="plan-item">
      <button class="remove-selection" data-remove-selection="${escapeHtml(selection.id)}" title="移除选择" type="button">×</button>
      <strong>${escapeHtml(selection.matchLabel)}</strong>
      <span>${escapeHtml(selection.marketLabel)} · ${escapeHtml(selection.pick)} · ${oddsText}${selection.note ? ` · ${escapeHtml(selection.note)}` : ""}</span>
    </article>
  `;
}

function savePlan() {
  const selections = getPlanSelections();
  normalizeStakeInput();
  const stake = toNumber(els.planStake.value);
  if (!selections.length) {
    showNotice("请先选择至少一场比赛。", "warn");
    return;
  }
  if (stake <= 0) {
    showNotice("投注金额必须大于 0。", "warn");
    els.planStake.focus();
    return;
  }

  const invalid = selections.find((selection) => selection.market !== "custom" && selection.odds <= 0);
  if (invalid) {
    showNotice(`${invalid.matchLabel} 的赔率为空，请等待赔率更新或改为手动录入。`, "warn");
    return;
  }

  const bet = settleBet({
    id: createId(),
    betDate: els.planDate.value || todayIso(),
    passType: els.planPassType.value || defaultPassType(selections),
    stake,
    status: "pending",
    returnAmount: 0,
    profit: 0,
    createdAt: new Date().toISOString(),
    selections,
  });

  state.bets.unshift(bet);
  state.plan = {};
  els.planPassType.value = "单关";
  persist();
  render();
  showNotice("购买方案已保存到投注记录。", "ok");
}

function normalizeStakeInput() {
  if (toNumber(els.planStake.value) < 0) els.planStake.value = "0";
}

function countPlanUnits(selections) {
  if (!selections.length) return 0;
  const byMatch = groupBy(selections, "matchId");
  return Object.values(byMatch).reduce((acc, rows) => acc * rows.length, 1);
}

function estimateMaxReturn(selections, stake) {
  if (!selections.length || stake <= 0 || selections.some((selection) => selection.odds <= 0)) return 0;
  const maxProduct = Object.values(groupBy(selections, "matchId")).reduce((acc, rows) => {
    const maxOdds = Math.max(...rows.map((selection) => selection.odds));
    return acc * maxOdds;
  }, 1);
  return stake * maxProduct;
}

function renderLedger() {
  const status = els.statusFilter.value;
  const bets = state.bets.filter((bet) => status === "all" || bet.status === status);
  if (!bets.length) {
    els.ledgerBody.innerHTML = `<tr><td colspan="8">${getEmptyState("还没有投注记录", "保存购买方案后，这里会显示结算明细。")}</td></tr>`;
    return;
  }

  els.ledgerBody.innerHTML = bets.map(renderLedgerRow).join("");
  els.ledgerBody.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleBetAction(button.dataset.id, button.dataset.action));
  });
}

function renderLedgerRow(bet) {
  const selections = Array.isArray(bet.selections) ? bet.selections : [];
  const summary = selections.map((selection) => `${selection.matchNum || ""} ${selection.marketLabel} ${selection.pick}`).join("；");
  return `
    <tr>
      <td>${escapeHtml(bet.betDate || "")}</td>
      <td>
        <strong>${escapeHtml(`${selections.length || 1} 项方案`)}</strong>
        <br><small>${escapeHtml(bet.passType || defaultPassType(selections))}</small>
      </td>
      <td>
        <div class="ledger-selection-list">${selections.map(renderLedgerSelection).join("")}</div>
        <small>${escapeHtml(summary || "手动场次")}</small>
      </td>
      <td>${money(bet.stake)}</td>
      <td>${escapeHtml(selectionResultText(selections))}</td>
      <td><span class="status-pill status-${escapeHtml(bet.status)}">${escapeHtml(statusName(bet.status))}</span></td>
      <td class="${bet.profit >= 0 ? "profit-pos" : "profit-neg"}">${money(bet.profit)}</td>
      <td>
        <div class="table-actions">
          <button class="mini-button" data-action="score" data-id="${escapeHtml(bet.id)}" type="button">比分</button>
          <button class="mini-button" data-action="win" data-id="${escapeHtml(bet.id)}" type="button">中奖</button>
          <button class="mini-button" data-action="lose" data-id="${escapeHtml(bet.id)}" type="button">未中</button>
          <button class="mini-button" data-action="void" data-id="${escapeHtml(bet.id)}" type="button">退款</button>
          <button class="mini-button" data-action="delete" data-id="${escapeHtml(bet.id)}" type="button">删除</button>
        </div>
      </td>
    </tr>
  `;
}

function renderLedgerSelection(selection) {
  return `
    <span class="ledger-selection">
      ${escapeHtml(selection.matchLabel)} · ${escapeHtml(selection.marketLabel)} ${escapeHtml(selection.pick)}
      <em>${selection.odds > 0 ? formatOdds(selection.odds) : "待赔率"}</em>
    </span>
  `;
}

function selectionResultText(selections) {
  const results = [...new Set(selections.map((selection) => selection.result).filter(Boolean))];
  return results.length ? results.join("；") : "--";
}

function handleBetAction(id, action) {
  const index = state.bets.findIndex((bet) => bet.id === id);
  if (index === -1) return;
  const bet = state.bets[index];

  if (action === "delete") {
    if (!confirm("删除这条购买方案？")) return;
    state.bets.splice(index, 1);
  }

  if (action === "score") {
    const score = prompt("输入比分。多场方案可用“WC001=2:1；WC002=0:0”，单场可直接输入“2:1”。", "");
    if (score === null) return;
    state.bets[index] = settleBet(applyManualScores(bet, score.trim()));
  }

  if (action === "win") {
    state.bets[index] = settleBet({ ...bet, status: "won" }, true);
  }

  if (action === "lose") {
    state.bets[index] = { ...bet, status: "lost", returnAmount: 0, profit: -toNumber(bet.stake) };
  }

  if (action === "void") {
    state.bets[index] = { ...bet, status: "void", returnAmount: toNumber(bet.stake), profit: 0 };
  }

  persist();
  render();
}

function applyManualScores(bet, input) {
  if (!input) return bet;
  const selections = bet.selections.map((selection) => ({ ...selection }));
  const assignments = parseScoreAssignments(input);

  if (assignments.size) {
    selections.forEach((selection) => {
      const key = normalizeMatchNum(selection.matchNum);
      if (assignments.has(key)) selection.result = assignments.get(key);
    });
    return { ...bet, selections };
  }

  if (selections.length === 1 && parseScore(input)) {
    selections[0].result = input;
  }
  return { ...bet, selections };
}

function parseScoreAssignments(input) {
  const map = new Map();
  String(input || "")
    .split(/[;；,，\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const match = part.match(/([A-Za-z]{0,3}\d{1,3}|周[一二三四五六日天]\s*\d{3})\s*[:=：]\s*(\d+\s*[:：-]\s*\d+)/);
      if (match) map.set(normalizeMatchNum(match[1]), normalizeScorePick(match[2]));
    });
  return map;
}

function settleBet(bet, forceWin = false) {
  const stake = toNumber(bet.stake);
  const selections = Array.isArray(bet.selections) ? bet.selections.map(normalizeSelection) : [];
  if (forceWin) {
    const returnAmount = estimateMaxReturn(selections, stake) || stake;
    return { ...bet, selections, status: "won", returnAmount, profit: returnAmount - stake };
  }
  if (!selections.length) return { ...bet, selections, status: "pending", returnAmount: 0, profit: 0 };

  const settledSelections = selections.map((selection) => settleSelection(selection));
  if (settledSelections.some((selection) => selection.status === "lost")) {
    return { ...bet, selections: settledSelections, status: "lost", returnAmount: 0, profit: -stake };
  }
  if (settledSelections.every((selection) => selection.status === "void")) {
    return { ...bet, selections: settledSelections, status: "void", returnAmount: stake, profit: 0 };
  }
  if (settledSelections.some((selection) => selection.status === "pending")) {
    return { ...bet, selections: settledSelections, status: "pending", returnAmount: 0, profit: 0 };
  }

  const returnAmount = calculateWinningReturn(settledSelections, stake);
  return { ...bet, selections: settledSelections, status: "won", returnAmount, profit: returnAmount - stake };
}

function settleSelection(selection) {
  if (/取消|无效|退款/.test(selection.result)) return { ...selection, status: "void" };
  if (!selection.result || selection.market === "custom") return { ...selection, status: "pending" };
  const score = parseScore(selection.result);
  if (!score) return { ...selection, status: "pending" };

  if (selection.market === "crs") {
    return { ...selection, status: isScorePickHit(selection.pick, score) ? "won" : "lost" };
  }

  const handicap = selection.market === "hhad" ? toNumber(selection.handicap) : 0;
  const diff = score.home - score.away + handicap;
  const outcome = diff > 0 ? "胜" : diff === 0 ? "平" : "负";
  return { ...selection, status: normalizePick(selection.pick) === outcome ? "won" : "lost" };
}

function calculateWinningReturn(selections, stake) {
  const activeSelections = selections.filter((selection) => selection.status === "won");
  const product = Object.values(groupBy(activeSelections, "matchId")).reduce((acc, rows) => {
    const maxOdds = Math.max(...rows.map((selection) => selection.odds || 1));
    return acc * maxOdds;
  }, 1);
  return stake * product;
}

function isScorePickHit(pick, score) {
  const normalized = normalizeScorePick(pick);
  if (normalized === `${score.home}:${score.away}`) return true;
  if (pick === "胜其他") return score.home > score.away && !CRS_OPTIONS.some((option) => option.group === "胜" && option.label === `${score.home}:${score.away}`);
  if (pick === "平其他") return score.home === score.away && !CRS_OPTIONS.some((option) => option.group === "平" && option.label === `${score.home}:${score.away}`);
  if (pick === "负其他") return score.home < score.away && !CRS_OPTIONS.some((option) => option.group === "负" && option.label === `${score.home}:${score.away}`);
  return false;
}

function parseScore(value) {
  const match = String(value || "").match(/(\d+)\s*[:：-]\s*(\d+)/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function normalizePick(value) {
  if (/主胜|胜$|让胜/.test(value)) return "胜";
  if (/平|让平/.test(value)) return "平";
  if (/客胜|负$|让负/.test(value)) return "负";
  return value;
}

function normalizeScorePick(value) {
  return String(value || "").replace(/\s/g, "").replace("：", ":");
}

function renderSummary() {
  const totalStake = sum(state.bets, "stake");
  const totalReturn = sum(state.bets, "returnAmount");
  const netProfit = sum(state.bets, "profit");
  const settled = state.bets.filter((bet) => ["won", "lost"].includes(bet.status));
  const won = settled.filter((bet) => bet.status === "won").length;
  const today = todayIso();
  const todayProfit = state.bets.filter((bet) => bet.betDate === today).reduce((acc, bet) => acc + toNumber(bet.profit), 0);

  els.netProfit.textContent = money(netProfit);
  els.roiText.textContent = `收益率 ${totalStake ? ((netProfit / totalStake) * 100).toFixed(1) : "0.0"}%`;
  els.totalStake.textContent = money(totalStake);
  els.ticketCount.textContent = `${state.bets.length} 个方案`;
  els.totalReturn.textContent = money(totalReturn);
  els.hitRate.textContent = `命中率 ${settled.length ? ((won / settled.length) * 100).toFixed(1) : "0.0"}%`;
  els.todayProfit.textContent = money(todayProfit);
  els.lastSync.textContent = state.lastSync ? `赛程同步 ${state.lastSync}` : "尚未同步";
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `worldcup2026-ledger-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importState(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state.matches = Array.isArray(parsed.matches) ? parsed.matches.filter(isWorldCupMatch).map(normalizeStoredMatch) : state.matches;
      state.bets = Array.isArray(parsed.bets) ? parsed.bets.map(normalizeStoredBet) : state.bets;
      state.plan = parsed.plan && typeof parsed.plan === "object" ? parsed.plan : state.plan;
      state.lastSync = parsed.lastSync || state.lastSync;
      persist();
      render();
      showNotice("备份已导入。", "ok");
    } catch (error) {
      showNotice("导入失败：文件不是有效 JSON。", "warn");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function showNotice(message, type = "") {
  els.syncNotice.textContent = message;
  els.syncNotice.className = `notice ${type}`;
}

function getEmptyState(title, text) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`;
}

function marketName(market) {
  return {
    had: "胜平负",
    hhad: "让球胜平负",
    crs: "比分",
    custom: "自定义",
  }[market] || market || "自定义";
}

function marketTabLabel(key, market) {
  if (key === "hhad" && market.goalLine !== undefined && market.goalLine !== "") return `让球 ${market.goalLine}`;
  return marketName(key);
}

function statusName(status) {
  return {
    pending: "未结算",
    won: "已中奖",
    lost: "未中奖",
    void: "无效/退款",
  }[status] || status;
}

function defaultPassType(selections) {
  const matchCount = new Set(selections.map((selection) => selection.matchId)).size;
  return matchCount <= 1 ? "单关" : `${matchCount} 串 1`;
}

function updatePlanPassType(selections) {
  const current = els.planPassType.value;
  if (!selections.length) {
    els.planPassType.value = "单关";
    return;
  }

  const recommended = defaultPassType(selections);
  const exists = [...els.planPassType.options].some((option) => option.value === recommended);
  const target = exists ? recommended : "混合过关";
  if (!current || current === "单关" || /^\d+\s*串\s*1$/.test(current)) {
    els.planPassType.value = target;
  }
}

function formatDateLabel(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(parsed);
  return `${date} ${weekday}`;
}

function stageName(value) {
  return {
    GROUP_STAGE: "小组赛",
    LAST_16: "1/8 决赛",
    QUARTER_FINALS: "1/4 决赛",
    SEMI_FINALS: "半决赛",
    THIRD_PLACE: "三四名决赛",
    FINAL: "决赛",
    TIMED: "未开赛",
    SCHEDULED: "未开赛",
    IN_PLAY: "进行中",
    PAUSED: "中场",
    FINISHED: "已完场",
    POSTPONED: "延期",
    CANCELLED: "取消",
  }[value] || value || "未开赛";
}

function kickoffLabel(match) {
  const datePart = match.date ? String(match.date).slice(5) : "";
  return [datePart, match.time || ""].filter(Boolean).join(" ") || "--:--";
}

function teamRank(rank) {
  const value = String(rank || "").trim();
  return value ? `<small>${escapeHtml(value)}</small>` : "";
}

function parseKickoff(utcDate) {
  if (!utcDate) return { date: "", time: "" };
  const parsed = new Date(utcDate);
  if (Number.isNaN(parsed.getTime())) {
    return {
      date: String(utcDate).slice(0, 10),
      time: String(utcDate).slice(11, 16),
    };
  }
  return {
    date: parsed.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" }),
    time: parsed.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }),
  };
}

function teamName(team, short = true) {
  if (!team || typeof team !== "object") return "待定";
  const keys = short ? ["shortName", "tla", "name"] : ["name", "shortName", "tla"];
  const value = keys.map((key) => team[key]).find((name) => name && !["TBD", "TBA"].includes(String(name).toUpperCase()));
  return value || "待定";
}

function localizeTeam(value) {
  const name = String(value || "").trim();
  if (!name) return "待定";
  return TEAM_NAME_ZH[name] || name;
}

function normalizeText(value) {
  return String(localizeTeam(value) || "").trim().toLowerCase().replace(/\s+/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function sum(rows, key) {
  return rows.reduce((acc, row) => acc + toNumber(row[key]), 0);
}

function money(value) {
  const number = toNumber(value);
  return `¥${number.toFixed(2)}`;
}

function formatOdds(value) {
  const number = toNumber(value);
  return number > 0 ? number.toFixed(2) : "";
}

function joinDateTime(date, time) {
  return [date, time].filter(Boolean).join(" ");
}

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "";
    if (!acc[value]) acc[value] = [];
    acc[value].push(row);
    return acc;
  }, {});
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  return window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
