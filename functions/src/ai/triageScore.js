"use strict";

const INCIDENT_BASE_SCORES = {
  "Hạt nhân": 95,
  "Động đất": 90,
  "Hỏa hoạn": 85,
  "Bão lũ": 80,
  "Dịch bệnh": 65,
  "Khác": 50
};

const CRITICAL_KEYWORDS = [
  "bất tỉnh",
  "không thở",
  "ngưng tim",
  "chảy máu nhiều",
  "mắc kẹt",
  "ngã lầu",
  "nhiều người bị thương",
  "trẻ em bị thương",
  "phóng xạ",
  "nhiễm xạ",
  "sập nhà",
  "vùi lấp",
  "lây lan nhanh",
  "tử vong"
];

const HIGH_KEYWORDS = [
  "gãy xương",
  "bỏng nặng",
  "khói dày",
  "người già",
  "phụ nữ mang thai",
  "cháy lớn",
  "ngập sâu",
  "lũ cuốn",
  "triệu chứng",
  "sốt cao",
  "khó thở",
  "nứt tường"
];

const KEYWORD_POINTS = {
  critical: 15,
  high: 8,
  maxBonus: 20
};

const MEDIA_BONUS = {
  image: 5,
  audio: 3
};

const TIME_ESCALATION = [
  { minMinutes: 5, maxMinutes: 10, bonus: 5 },
  { minMinutes: 10, maxMinutes: 20, bonus: 10 },
  { minMinutes: 20, maxMinutes: Infinity, bonus: 15 }
];

const LABELS = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low"
};

const LABEL_RANGES = [
  { min: 80, max: 100, label: LABELS.critical },
  { min: 60, max: 79, label: LABELS.high },
  { min: 40, max: 59, label: LABELS.medium },
  { min: 0, max: 39, label: LABELS.low }
];

const LABEL_COLORS = {
  [LABELS.critical]: "#B91C1C",
  [LABELS.high]: "#DC2626",
  [LABELS.medium]: "#EA580C",
  [LABELS.low]: "#CA8A04"
};

const LABEL_TEXT = {
  [LABELS.critical]: "Nguy cấp",
  [LABELS.high]: "Cao",
  [LABELS.medium]: "Trung bình",
  [LABELS.low]: "Thấp"
};

const DEFAULT_INCIDENT_TYPE = "Khác";

const clampScore = (value) => Math.max(0, Math.min(100, value));

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const countKeywordBonus = (text, keywords, perKeyword) => {
  if (!text) {
    return 0;
  }

  let bonus = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      bonus += perKeyword;
    }
  }

  return bonus;
};

const getTimeEscalationBonus = (minutesWaiting) => {
  if (typeof minutesWaiting !== "number" || Number.isNaN(minutesWaiting)) {
    return 0;
  }

  const minutes = Math.max(0, minutesWaiting);
  for (const rule of TIME_ESCALATION) {
    if (minutes >= rule.minMinutes && minutes < rule.maxMinutes) {
      return rule.bonus;
    }
  }

  return 0;
};

const resolveIncidentType = (incidentType) => {
  if (typeof incidentType !== "string") {
    return DEFAULT_INCIDENT_TYPE;
  }

  return Object.prototype.hasOwnProperty.call(INCIDENT_BASE_SCORES, incidentType)
    ? incidentType
    : DEFAULT_INCIDENT_TYPE;
};

/**
 * Tinh diem uu tien cho mot SOS dua tren loai su co, mo ta, media va thoi gian cho.
 *
 * @param {Object} params
 * @param {string} params.incidentType - Loai su co theo thiet ke (6 loai).
 * @param {string | null | undefined} params.description - Mo ta tu nguoi gui SOS.
 * @param {boolean} params.hasImage - Co dinh kem anh.
 * @param {boolean} params.hasAudio - Co dinh kem ghi am.
 * @param {number} params.minutesWaiting - So phut da cho.
 * @returns {{ score: number, label: string }}
 */
const calculateTriageScore = (params) => {
  const safeParams = params || {};
  const incidentType = resolveIncidentType(safeParams.incidentType);
  const description = normalizeText(safeParams.description);

  let score = INCIDENT_BASE_SCORES[incidentType];

  const criticalBonus = countKeywordBonus(
    description,
    CRITICAL_KEYWORDS,
    KEYWORD_POINTS.critical
  );
  const highBonus = countKeywordBonus(
    description,
    HIGH_KEYWORDS,
    KEYWORD_POINTS.high
  );
  const keywordBonus = Math.min(
    KEYWORD_POINTS.maxBonus,
    criticalBonus + highBonus
  );
  score += keywordBonus;

  if (safeParams.hasImage) {
    score += MEDIA_BONUS.image;
  }
  if (safeParams.hasAudio) {
    score += MEDIA_BONUS.audio;
  }

  score += getTimeEscalationBonus(safeParams.minutesWaiting);

  const finalScore = clampScore(score);
  const label = LABEL_RANGES.find(
    (range) => finalScore >= range.min && finalScore <= range.max
  )?.label || LABELS.low;

  return { score: finalScore, label };
};

/**
 * Lay ma mau hex tuong ung voi label.
 *
 * @param {string} label
 * @returns {string}
 */
const getScoreColor = (label) => LABEL_COLORS[label] || LABEL_COLORS[LABELS.low];

/**
 * Lay ten tieng Viet tuong ung voi label.
 *
 * @param {string} label
 * @returns {string}
 */
const getLabelText = (label) => LABEL_TEXT[label] || LABEL_TEXT[LABELS.low];

module.exports = {
  INCIDENT_BASE_SCORES,
  CRITICAL_KEYWORDS,
  HIGH_KEYWORDS,
  KEYWORD_POINTS,
  MEDIA_BONUS,
  TIME_ESCALATION,
  LABELS,
  LABEL_RANGES,
  LABEL_COLORS,
  LABEL_TEXT,
  DEFAULT_INCIDENT_TYPE,
  calculateTriageScore,
  getScoreColor,
  getLabelText
};
