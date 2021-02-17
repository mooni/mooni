const COUTRIES_EU = {
  AT: 'Austria',
  BE: 'Belgium',
  BG: 'Bulgaria',
  CY: 'Cyprus',
  HR: 'Croatia',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  EE: 'Estonia',
  FI: 'Finland',
  FR: 'France',
  DE: 'Germany',
  GR: 'Greece',
  HU: 'Hungary',
  IS: 'Iceland',
  IE: 'Ireland',
  IT: 'Italy',
  LV: 'Latvia',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MT: 'Malta',
  NL: 'Netherlands',
  NO: 'Norway',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SI: 'Slovenia',
  SK: 'Slovakia',
  ES: 'Spain',
  SE: 'Sweden',
};

const COUNTRIES_NON_EEA = {
  AD: 'Andorra',
  CH: 'Switzerland',
  GB: 'United Kingdom',
  GG: 'Guernsey',
  GI: 'Gibraltar',
  JE: 'Jersey',
  MC: 'Monaco',
}

export const COUNTRIES_MAP = {
  ...COUTRIES_EU,
  ...COUNTRIES_NON_EEA,
};

export const COUNTRIES_ARRAY = Object.entries(COUNTRIES_MAP).map(e => ({ code: e[0], label: e[1]}));