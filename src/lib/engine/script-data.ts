/**
 * THE SCRIPT — "How Professionals De-Risk Without a Huge Tax Bill"
 * (Concentrated Stock Positions — the six exits).
 *
 * The complete Concentrated_Stock_SCRIPT.md, structured as chapters → beats.
 * Every beat carries the exact voiceover text from the script plus the
 * on-screen scene direction. Scene props use the GILDED LEDGER drawer set
 * (scenes-finance.ts) plus the engine's reusable statement/data scenes.
 *
 * `[SRC]` cues ride the beat's scene as `src` — the lower-third citation
 * chip the researched-channel signature renders on every data scene.
 */

export interface BeatSpec {
  /** Voiceover text (verbatim from the script) */
  vo: string;
  /** ms of silence after this beat */
  pauseAfter?: number;
  /** scene props; `sceneKey` groups consecutive beats into one continuous scene */
  scene: { type: string; sceneKey: string; [k: string]: unknown };
  /** per-beat vocal direction (maps to TTS rate/pitch offsets) */
  voStyle?: 'calm' | 'neutral' | 'urgent' | 'reveal' | 'quote';
  /** a completely different Edge voice for this beat (quoted characters) */
  voice?: string;
  /** duck the BGM to near-silence just before this beat's payoff line */
  dropOut?: boolean;
}

export interface ChapterSpec {
  id: string;
  title: string;
  beats: BeatSpec[];
}

const P = (type: string, sceneKey: string, props: Record<string, unknown> = {}) => ({
  type,
  sceneKey,
  ...props,
});

export const SCRIPT: ChapterSpec[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // COLD OPEN — the two fortunes
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'cold-open',
    title: 'Ballmer vs Gates — the same decision, $100B apart',
    beats: [
      {
        vo:
          "In July 2024, Steve Ballmer passed Bill Gates on the Bloomberg Billionaires Index.",
        pauseAfter: 300,
        voStyle: 'urgent',
        scene: P('crossChart', 'co-cross', {
          opening: true,
          title: 'July 1, 2024 — Bloomberg Billionaires Index',
          mode: 'build-a',
          src: 'Bloomberg Billionaires Index, July 1, 2024',
        }),
      },
      {
        vo:
          'One company. Two decisions: hold, or sell.',
        pauseAfter: 300,
        scene: P('crossChart', 'co-cross', {
          title: 'July 1, 2024 — Bloomberg Billionaires Index',
          mode: 'build-b',
          src: 'Bloomberg Billionaires Index, July 1, 2024',
        }),
      },
      {
        vo:
          'Same stock, same day \u2014 a hundred billion apart.',
        pauseAfter: 300,
        scene: P('crossChart', 'co-cross', {
          title: 'July 1, 2024 — Bloomberg Billionaires Index',
          mode: 'cross-marked',
          src: 'Bloomberg Billionaires Index, July 1, 2024',
        }),
      },
      {
        vo:
          'One decision made the difference.',
        pauseAfter: 300,
        voStyle: 'reveal',
        scene: P('crossChart', 'co-cross', {
          title: 'July 1, 2024 — Bloomberg Billionaires Index',
          mode: 'delta',
          src: 'Bloomberg Billionaires Index, July 1, 2024',
        }),
      },
      {
        vo:
          'The tax bill on holding: three-point-seven million.',
        pauseAfter: 450,
        scene: P('statCards', 'co-bill', {
          cards: [
            { big: '$3.7M', label: 'the tax bill on a $10M position, near-zero basis, California', tag: 'federal LTCG + NIIT + state', tone: 'down' },
            { big: '$10M', label: 'the concentrated position', tag: 'near-zero basis', tone: 'gold' },
          ],
        }),
      },
      {
        vo:
          'So \u2014 what is that tax buying you?',
        pauseAfter: 600,
        voStyle: 'reveal',
        scene: P('host', 'co-question', {
          headline: 'What is the tax\nbuying you?',
          kicker: 'the only question that matters',
        }),
      },
      {
        vo:
          "Now the other tail. In 2001, Enron's employees had sixty-two percent of their 401(k) — about one-point-three billion dollars — in Enron stock.",
        pauseAfter: 500,
        voStyle: 'calm',
        scene: P('drawdownChart', 'co-enron', {
          title: 'The other tail — Enron, 2001',
          mode: 'enron',
          src: 'CNN Money, Jan 14, 2002; U.S. Senate HSGAC report',
        }),
      },
      {
        vo:
          "Many couldn't sell the company match before age fifty. Then they were locked out of the plan entirely during an administrator change, while the stock went to zero.",
        pauseAfter: 700,
        scene: P('drawdownChart', 'co-enron', {
          title: 'The other tail — Enron, 2001',
          mode: 'to-zero',
          src: 'CNN Money, Jan 14, 2002; U.S. Senate HSGAC report',
        }),
      },
      {
        vo:
          'Here is the uncomfortable truth this video is about: holding concentrated stock is not a strategy. It is a coin flip you keep re-making every morning you don\u2019t sell.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('bigText', 'co-truth', {
          lines: ['Holding is not a strategy.', 'It is a coin flip you re-make every morning.'],
        }),
      },
      {
        vo:
          'There are six professional answers.',
        pauseAfter: 450,
        scene: P('exitTiles', 'co-six', {
          mode: 'title',
        }),
      },
      {
        vo: 'One requires a seven-year marriage you cannot cheaply leave.',
        pauseAfter: 400,
        scene: P('exitTiles', 'co-six', { mode: 'spot-2' }),
      },
      {
        vo: 'One is the trade that saved Mark Cuban a billion dollars.',
        pauseAfter: 400,
        scene: P('exitTiles', 'co-six', { mode: 'spot-4' }),
      },
      {
        vo: 'One got a CEO sentenced to federal prison — and then he was pardoned.',
        pauseAfter: 400,
        scene: P('exitTiles', 'co-six', { mode: 'spot-1' }),
      },
      {
        vo:
          'And one is, on paper, the best after-tax outcome available — but you can never touch the principal again.',
        pauseAfter: 500,
        scene: P('exitTiles', 'co-six', { mode: 'spot-5' }),
      },
      {
        vo:
          'By the end you will know which one fits your balance sheet, which one is quietly worse than a three-basis-point ETF, and the 2026 rule changes that quietly re-priced two of them.',
        pauseAfter: 500,
        scene: P('exitTiles', 'co-six', { mode: 'all' }),
      },
      {
        vo:
          'Every number I quote is sourced — research papers, SEC filings, court records, provider disclosures — linked below. If a claim is a backtest or a vendor\u2019s own marketing, I will tell you. That is the deal.',
        pauseAfter: 600,
        scene: P('srcCite', 'co-deal', {
          source: 'Research papers · SEC filings · Court records · Provider disclosures',
          detail: 'every claim carries its source on screen',
        }),
      },
      {
        vo:
          'Bookmark this now. You will want the decision framework at the end open in a tab the next time a tranche vests. Let\u2019s walk the six exits.',
        pauseAfter: 700,
        voStyle: 'neutral',
        scene: P('exitTiles', 'co-six', { mode: 'save-prompt' }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // CHAPTER 1 — the math of the trap
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'ch1',
    title: 'The math of the trap',
    beats: [
      {
        vo:
          'Start with the base rate, because your employer\u2019s stock feels special and the data says it probably isn\u2019t.',
        pauseAfter: 500,
        scene: P('host', 'c1-base', {
          headline: 'The base rate\nof a single stock',
          verb: 'card', gesture: 'think',
          kicker: 'chapter one — the math of the trap',
        }),
      },
      {
        vo:
          'J.P. Morgan\u2019s long-running study of every stock that entered the Russell 3000 since 1980 found two things.',
        pauseAfter: 450,
        scene: P('distBars', 'c1-jpm', {
          mode: 'intro',
          title: 'J.P. Morgan — every Russell 3000 entrant since 1980',
          src: 'J.P. Morgan, \u201cThe Agony and the Ecstasy,\u201d 2014; 2024 update',
        }),
      },
      {
        vo: 'Roughly two-thirds of them underperformed the index itself.',
        pauseAfter: 500,
        scene: P('distBars', 'c1-jpm', {
          mode: 'bar-1',
          title: 'J.P. Morgan — every Russell 3000 entrant since 1980',
          src: 'J.P. Morgan, \u201cThe Agony and the Ecstasy,\u201d 2014; 2024 update',
        }),
      },
      {
        vo:
          'And about forty percent suffered what they call a catastrophic loss — a decline of seventy percent or more from the peak, that they never recovered from.',
        pauseAfter: 600,
        scene: P('distBars', 'c1-jpm', {
          mode: 'bar-2',
          title: 'J.P. Morgan — every Russell 3000 entrant since 1980',
          src: 'J.P. Morgan, \u201cThe Agony and the Ecstasy,\u201d 2014; 2024 update',
        }),
      },
      {
        vo: 'The 2024 update puts that catastrophic share at forty-four percent through 2020.',
        pauseAfter: 550,
        scene: P('distBars', 'c1-jpm', {
          mode: 'bar-3',
          title: 'J.P. Morgan — every Russell 3000 entrant since 1980',
          src: 'J.P. Morgan, \u201cThe Agony and the Ecstasy,\u201d 2014; 2024 update',
        }),
      },
      {
        vo: 'Not forty percent of penny stocks. Forty percent of the investable universe.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('bigText', 'c1-punch', {
          lines: ['40% of the', 'investable universe.'],
        }),
      },
      {
        vo:
          'Hendrik Bessembinder\u2019s research at Arizona State goes further: from 1926 to 2016, just four percent of all listed U.S. companies — about eleven hundred names — accounted for the entire net wealth creation of the American stock market.',
        pauseAfter: 400,
        scene: P('dotGrid', 'c1-bess', {
          title: 'Bessembinder — where the wealth came from, 1926\u20132016',
          total: 100,
          highlight: 4,
          // F1: the caption prop the scene's count-up block reads — both
          // beats shipped without it and the literal word "undefined" hit
          // the canvas. Copy from the beat's own narration.
          caption: 'names — all the net wealth creation',
          src: 'Bessembinder, \u201cDo Stocks Outperform Treasury Bills?\u201d, JFE 2018',
        }),
      },
      {
        vo: 'The other ninety-six percent, collectively, matched Treasury bills.',
        pauseAfter: 700,
        scene: P('dotGrid', 'c1-bess', {
          title: 'Bessembinder — where the wealth came from, 1926\u20132016',
          total: 100,
          highlight: 4,
          mode: 'rest-note',
          caption: 'matched Treasury bills, collectively',
          src: 'Bessembinder, \u201cDo Stocks Outperform Treasury Bills?\u201d, JFE 2018',
        }),
      },
      {
        vo:
          'Now, the other side — because this channel does not do one-sided. Concentration is also how the winners won.',
        pauseAfter: 500,
        scene: P('host', 'c1-both', {
          headline: 'Concentration is\nalso how the winners won',
          kicker: 'the both-sides beat',
        }),
      },
      {
        vo:
          'Ballmer is richer than Gates precisely because he concentrated. Pick the right stock, hold it for forty years, and diversification is the mistake.',
        pauseAfter: 500,
        scene: P('host', 'c1-both', {
          headline: 'Pick the right stock,\nhold it forty years',
          verb: 'card', gesture: 'count2',
          kicker: 'the both-sides beat',
        }),
      },
      {
        vo:
          'The problem is not that concentration never works. The problem is that you cannot know, in advance, which side of the distribution you are on — and the downside is not \u201cunderperform by two percent.\u201d',
        pauseAfter: 450,
        scene: P('host', 'c1-both', {
          headline: 'You cannot know,\nin advance,',
          gesture: 'shrug',
          kicker: 'which side of the distribution you are on',
        }),
      },
      {
        vo: 'The downside is Enron. It is UnitedHealth.',
        pauseAfter: 600,
        voStyle: 'reveal',
        scene: P('drawdownChart', 'c1-unh', {
          title: 'UnitedHealth — the compounder that broke',
          mode: 'unh-path',
          src: 'Yahoo Finance / STAT, May 13, 2025',
        }),
      },
      {
        vo:
          'UnitedHealth was a darling compounder for a decade. Between late 2024 and early 2026 it lost more than half its value — a CEO stepping down, a pulled forecast, a reported federal investigation.',
        pauseAfter: 500,
        scene: P('drawdownChart', 'c1-unh', {
          title: 'UnitedHealth — the compounder that broke',
          mode: 'shade-loss',
          src: 'Yahoo Finance / STAT, May 13, 2025',
        }),
      },
      {
        vo:
          'If you were a UnitedHealth executive with seventy percent of your net worth in UNH, the twenty-four percent you \u201csaved\u201d by not selling looks very small next to a fifty-percent drawdown.',
        pauseAfter: 450,
        scene: P('drawdownChart', 'c1-unh', {
          title: 'UnitedHealth — the compounder that broke',
          mode: 'vs-math',
          src: 'Yahoo Finance / STAT, May 13, 2025',
        }),
      },
      {
        vo:
          'The tax you were avoiding was a rounding error against the risk you were carrying.',
        pauseAfter: 650,
        voStyle: 'reveal',
        scene: P('drawdownChart', 'c1-unh', {
          title: 'UnitedHealth — the compounder that broke',
          mode: 'punch',
          src: 'Yahoo Finance / STAT, May 13, 2025',
        }),
      },
      {
        vo:
          'And yet the tax is real. On a ten-million-dollar position with near-zero basis — founder stock, early RSUs that vested at a fraction of today\u2019s price — you owe twenty percent federal long-term capital gains, plus the three-point-eight percent net investment income tax.',
        pauseAfter: 450,
        scene: P('taxStack', 'c1-tax', {
          mode: 'row-1',
          title: 'The bill, line by line — $10M position, near-zero basis',
          src: 'IRC \u00a71(h), \u00a71411',
        }),
      },
      {
        vo:
          'That is twenty-three-point-eight percent before your state takes a bite. In California, call it thirty-seven. In New York City, the high thirties.',
        pauseAfter: 450,
        scene: P('taxStack', 'c1-tax', {
          mode: 'row-2',
          title: 'The bill, line by line — $10M position, near-zero basis',
          src: 'IRC \u00a71(h), \u00a71411; CA FTB / NY DTF top rates',
        }),
      },
      {
        vo:
          'On ten million, roughly three-point-seven million dollars out the door.',
        pauseAfter: 700,
        voStyle: 'reveal',
        dropOut: true,
        scene: P('taxStack', 'c1-tax', {
          mode: 'total',
          title: 'The bill, line by line — $10M position, near-zero basis',
          src: 'IRC \u00a71(h), \u00a71411; CA FTB / NY DTF top rates',
        }),
      },
      {
        vo:
          'So both things are true at once. The risk of holding is enormous and probabilistic. The cost of selling is large and certain. That tension is the entire subject.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('host', 'c1-tension', {
          headline: 'Enormous and probabilistic.\nLarge and certain.',
          gesture: 'aha',
          kicker: 'both true at once — that tension is the subject',
        }),
      },
      {
        vo:
          'Here is the statistic that should reframe it. BlackRock\u2019s inaugural Advisor Trends Survey — over a thousand U.S. advisors, fielded by Escalent in late 2025 — found that sixty-three percent of millennial advisors courting wealthy clients now offer concentrated-stock solutions, versus fifty-five percent of Gen X and fifty-three percent of Boomers.',
        pauseAfter: 400,
        scene: P('barsCompare', 'c1-survey', {
          title: 'Advisors offering concentrated-stock solutions',
          bars: [
            { label: 'Millennial advisors', value: 63, tone: 'up', tag: '' },
            { label: 'Gen X advisors', value: 55, tone: 'muted', tag: '' },
            { label: 'Boomer advisors', value: 53, tone: 'muted', tag: '' },
          ],
          yMax: 80,
          src: 'BlackRock Advisor Trends Survey 2025; InvestmentNews, Jan 14, 2026',
        }),
      },
      {
        vo: 'The younger advisors get it.',
        pauseAfter: 450,
        scene: P('barsCompare', 'c1-survey', {
          title: 'Advisors offering concentrated-stock solutions',
          bars: [
            { label: 'Millennial advisors', value: 63, tone: 'up', tag: '' },
            { label: 'Gen X advisors', value: 55, tone: 'muted', tag: '' },
            { label: 'Boomer advisors', value: 53, tone: 'muted', tag: '' },
          ],
          yMax: 80,
          src: 'BlackRock Advisor Trends Survey 2025; InvestmentNews, Jan 14, 2026',
        }),
      },
      {
        vo:
          'But the same survey found something damning: ninety-two percent of advisors serving the wealthy say they are asked for tax guidance — yet only seventeen percent treat after-tax return as a primary driver of portfolio decisions.',
        pauseAfter: 450,
        scene: P('statCards', 'c1-gap', {
          cards: [
            { big: '92%', label: 'are asked for tax guidance', tag: 'the industry sells tax-awareness', tone: 'gold' },
            { big: '17%', label: 'treat after-tax return as a primary driver', tag: '…and delivers paralysis', tone: 'down' },
          ],
        }),
      },
      {
        vo:
          'The industry is selling tax-awareness and delivering tax-avoidance-as-paralysis.',
        pauseAfter: 600,
        voStyle: 'reveal',
        scene: P('stampCard', 'c1-stamp', {
          stamp: 'PARALYSIS',
          sub: 'sold as tax-awareness',
        }),
      },
      {
        vo:
          'So let me give you the peer-reviewed version of \u201cjust pay the tax.\u201d In a 2025 study in the Journal of Asset Management, BlackRock\u2019s researchers backtested three hundred and eighty historical ten-year paths.',
        pauseAfter: 450,
        scene: P('host', 'c1-jam', {
          headline: 'The peer-reviewed\nversion of \u201cjust pay the tax\u201d',
          gesture: 'think',
          kicker: '380 ten-year paths, backtested',
        }),
      },
      {
        vo:
          'Their finding: selling the whole position immediately and reinvesting in the index performed, on average, about in line with holding the stock — after tax.',
        pauseAfter: 500,
        scene: P('host', 'c1-jam', {
          headline: 'Sell everything today,\nbuy the index —',
          gesture: 'pointR',
          kicker: '\u2248 in line with holding, after tax, on average',
        }),
      },
      {
        vo:
          'The tax bill you are terrified of was, on average, paid for by the risk you removed.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('bigText', 'c1-jam-punch', {
          lines: ['The tax was paid for', 'by the risk you removed.'],
        }),
      },
      {
        vo:
          'That does not mean always sell everything today. It means the tax is the price of the exit, not a reason to stay in the building.',
        pauseAfter: 450,
        scene: P('host', 'c1-jam', {
          headline: 'The tax is the price\nof the exit —',
          gesture: 'count1',
          kicker: 'not a reason to stay in the building',
        }),
      },
      {
        vo:
          'And it means the sophisticated strategies we are about to cover have to beat a very simple benchmark: pay the tax, buy the index, sleep at night.',
        pauseAfter: 600,
        scene: P('statCards', 'c1-bench', {
          cards: [
            { big: '1', label: 'pay the tax', tag: 'the benchmark every exit must beat', tone: 'gold' },
            { big: '2', label: 'buy the index', tag: '', tone: 'up' },
            { big: '3', label: 'sleep at night', tag: '', tone: 'up' },
          ],
        }),
      },
      {
        vo:
          'Six exits. From the one your compliance department already knows, to the one your family office whispers about.',
        pauseAfter: 800,
        voStyle: 'neutral',
        scene: P('exitTiles', 'c1-out', { mode: 'all' }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // EXIT 1 — the 10b5-1 plan
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'exit1',
    title: 'Exit 1 — 10b5-1 plans: discipline, not tax avoidance',
    beats: [
      {
        vo:
          'The first exit is the one most executives already have, and most misuse.',
        pauseAfter: 500,
        scene: P('host', 'e1-intro', {
          headline: 'Exit one — the 10b5-1 plan\nmost executives misuse',
          kicker: 'exit 1 of 6 — the conveyor belt',
        }),
      },
      {
        vo:
          'A 10b5-1 plan is a pre-scheduled, written instruction to sell shares on a set schedule or at set prices, adopted at a time when you do not possess material non-public information.',
        pauseAfter: 450,
        scene: P('planConveyor', 'e1-plan', {
          mode: 'intro',
          title: 'The 10b5-1 plan — a written instruction, adopted in the clear',
          src: 'SEC Rule 10b5-1; Dec 2022 amendments',
        }),
      },
      {
        vo:
          'It removes your discretion. That is the whole point. It is an affirmative defense against insider-trading liability — not a tax strategy.',
        pauseAfter: 450,
        scene: P('planConveyor', 'e1-plan', {
          mode: 'no-discretion',
          title: 'The 10b5-1 plan — a written instruction, adopted in the clear',
          src: 'SEC Rule 10b5-1; Dec 2022 amendments',
        }),
      },
      {
        vo:
          'You pay full capital gains on every share it sells.',
        pauseAfter: 600,
        voStyle: 'reveal',
        scene: P('planConveyor', 'e1-plan', {
          mode: 'full-tax',
          title: 'The 10b5-1 plan — a written instruction, adopted in the clear',
          src: 'SEC Rule 10b5-1; Dec 2022 amendments',
        }),
      },
      {
        vo:
          'Why start here? Because it is the baseline every other strategy is measured against, and because the discipline is the feature.',
        pauseAfter: 500,
        scene: P('host', 'e1-why', {
          headline: 'The discipline\nis the feature',
          verb: 'card', gesture: 'leanIn',
          kicker: 'the baseline every exit is measured against',
        }),
      },
      {
        vo:
          'Jeff Bezos sold roughly four billion dollars of Amazon in August 2026 — through a plan he adopted on November fourteenth, 2025.',
        pauseAfter: 400,
        scene: P('planConveyor', 'e1-bezos', {
          mode: 'bezos',
          title: 'Bezos, August 2026 — $4B sold on a plan adopted 9 months earlier',
          src: 'Yahoo Finance, Aug 6, 2026; Barron\u2019s, Feb 2, 2024',
        }),
      },
      {
        vo:
          'The sale was scheduled before the earnings beat that preceded it. He did not time it. The plan timed it.',
        pauseAfter: 450,
        scene: P('planConveyor', 'e1-bezos', {
          mode: 'plan-timed',
          title: 'Bezos, August 2026 — $4B sold on a plan adopted 9 months earlier',
          src: 'Yahoo Finance, Aug 6, 2026; Barron\u2019s, Feb 2, 2024',
        }),
      },
      {
        vo:
          'That is what a correctly used plan looks like: you commit in advance, and you let the schedule execute regardless of what you know or feel later. His earlier 2024 plan authorized up to fifty million shares — about eight-point-six billion dollars.',
        pauseAfter: 600,
        scene: P('planConveyor', 'e1-bezos', {
          mode: 'commit',
          title: 'Bezos, August 2026 — $4B sold on a plan adopted 9 months earlier',
          src: 'Yahoo Finance, Aug 6, 2026; Barron\u2019s, Feb 2, 2024',
        }),
      },
      {
        vo:
          'Now the trap. In December 2022 the SEC amended the rule, effective 2023, because executives were abusing it.',
        pauseAfter: 450,
        voStyle: 'calm',
        scene: P('planConveyor', 'e1-sec', {
          mode: 'sec-tighten',
          title: 'The 2022 amendments — the autopilot becomes a legal instrument',
          src: 'SEC Release 33-11138, Dec 14, 2022',
        }),
      },
      {
        vo:
          'For directors and officers, trading cannot begin until the later of ninety days after adoption, or two business days after the company files the quarterly or annual report covering the quarter you adopted in — capped at a hundred and twenty days. Overlapping plans for the same class of stock are generally banned.',
        pauseAfter: 400,
        scene: P('planConveyor', 'e1-sec', {
          mode: 'cooling',
          title: 'The 2022 amendments — the autopilot becomes a legal instrument',
          src: 'SEC Release 33-11138, Dec 14, 2022',
        }),
      },
      {
        vo:
          'You must certify, in writing, that you are acting in good faith and hold no material non-public information. And the company must disclose plan adoptions and terminations in its 10-Qs and 10-Ks; you check a box on your Form 4.',
        pauseAfter: 600,
        scene: P('planConveyor', 'e1-sec', {
          mode: 'certify',
          title: 'The 2022 amendments — the autopilot becomes a legal instrument',
          src: 'SEC Release 33-11138, Dec 14, 2022',
        }),
      },
      {
        vo:
          'The plan is no longer a quiet autopilot. It is a publicly filed legal instrument, and regulators run data-driven screens on it.',
        pauseAfter: 650,
        voStyle: 'reveal',
        scene: P('planConveyor', 'e1-sec', {
          mode: 'screened',
          title: 'The 2022 amendments — the autopilot becomes a legal instrument',
          src: 'SEC Release 33-11138, Dec 14, 2022',
        }),
      },
      {
        vo:
          'Which brings me to the CEO I promised you. Terren Peizer ran a healthcare company called Ontrak. He adopted 10b5-1 plans while knowing a major customer was about to terminate its contract — information the market did not have.',
        pauseAfter: 450,
        scene: P('quoteCard', 'e1-peizer', {
          kicker: 'the CEO who used the plan as a weapon',
          lines: ['Terren Peizer —', 'Ontrak.'],
          soft: false,
        }),
      },
      {
        vo:
          'The plans sold before the news broke, avoiding more than twelve-and-a-half million dollars in losses.',
        pauseAfter: 400,
        scene: P('quoteCard', 'e1-peizer', {
          kicker: 'the plans sold before the news broke',
          lines: ['$12.5M in losses,', 'avoided.'],
          soft: false,
        }),
      },
      {
        vo:
          'In June 2024 a jury convicted him of securities fraud and two counts of insider trading — the first criminal conviction based solely on the misuse of a 10b5-1 plan. He was sentenced to forty-two months and a five-and-a-quarter-million-dollar fine.',
        pauseAfter: 550,
        scene: P('quoteCard', 'e1-peizer', {
          kicker: 'the first criminal conviction on a 10b5-1 plan alone',
          lines: ['42 months.', '$5.25M fine.'],
          soft: false,
          src: 'DOJ, June 23, 2025; U.S. v. Peizer, C.D. Cal.',
        }),
      },
      {
        vo:
          'And here is the part that makes this a real story instead of a morality play: in January 2026, President Trump pardoned him. The SEC dropped its parallel civil case that August.',
        pauseAfter: 500,
        scene: P('stampCard', 'e1-pardon', {
          stamp: 'PARDONED',
          sub: 'January 2026 — the conviction did not stand',
        }),
      },
      {
        vo:
          'The conviction did not stand. But the legal architecture did. The 2022 amendments, the cooling-off periods, the certifications, the disclosure regime — none of that was undone by a pardon.',
        pauseAfter: 450,
        scene: P('planConveyor', 'e1-sec', {
          mode: 'architecture',
          title: 'The 2022 amendments — the autopilot becomes a legal instrument',
          src: 'SEC Release 33-11138, Dec 14, 2022',
        }),
      },
      {
        vo:
          'And two years before Peizer, the SEC had already settled insider-trading charges against Cheetah Mobile\u2019s CEO and former president for setting up plans while holding negative revenue information. The enforcement pattern is the point, not the pardon.',
        pauseAfter: 650,
        scene: P('srcCite', 'e1-pattern', {
          source: 'SEC Press Release 2022-169, Sept 21, 2022',
          detail: 'the enforcement pattern is the point, not the pardon',
        }),
      },
      {
        vo:
          'So: the kill condition. A 10b5-1 plan is the wrong answer if you think it lets you trade on what you know. It is the wrong answer if you need the tax gone — it does nothing for the tax.',
        pauseAfter: 400,
        voStyle: 'calm',
        scene: P('killCard', 'e1-kill', {
          mode: 'item-1',
          title: 'Exit 1 — the kill conditions',
        }),
      },
      {
        vo:
          'And it is the wrong answer if you cannot commit to a schedule, because modifying or canceling a plan while holding bad news is itself evidence of bad faith.',
        pauseAfter: 600,
        scene: P('killCard', 'e1-kill', {
          mode: 'item-2',
          title: 'Exit 1 — the kill conditions',
        }),
      },
      {
        vo:
          'What it is right for: new vests and option exercises you want to convert to cash on autopilot, with legal cover, while you decide what to do with the existing block.',
        pauseAfter: 450,
        scene: P('host', 'e1-right', {
          headline: 'New vests, on autopilot,\nwith legal cover —',
          gesture: 'count3',
          kicker: 'while you decide what to do with the block',
        }),
      },
      {
        vo:
          'It is the conveyor belt. The next five strategies are what you do with the warehouse.',
        pauseAfter: 500,
        voStyle: 'reveal',
        scene: P('planConveyor', 'e1-plan', {
          mode: 'conveyor-punch',
          title: 'The conveyor belt',
        }),
      },
      {
        vo: 'And the first of those requires a seven-year marriage.',
        pauseAfter: 800,
        voStyle: 'quote',
        scene: P('host', 'e1-out', {
          headline: 'The first of those requires\na seven-year marriage.',
          gesture: 'close',
          kicker: 'exit 2 — the exchange fund',
        }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // EXIT 2 — exchange funds
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'exit2',
    title: 'Exit 2 — Exchange funds: the seven-year marriage',
    beats: [
      {
        vo:
          'An exchange fund is a private partnership. You contribute your appreciated stock; a hundred other investors contribute theirs; in return you own a pro-rata slice of the entire pooled basket.',
        pauseAfter: 450,
        scene: P('poolFund', 'e2-pool', {
          mode: 'contribute',
          title: 'The exchange fund — one pool, one hundred single stocks',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'Under Section 721 of the tax code, contributing property to a partnership is not a sale. No immediate tax.',
        pauseAfter: 450,
        scene: P('poolFund', 'e2-pool', {
          mode: 's721',
          title: 'The exchange fund — one pool, one hundred single stocks',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'You have swapped single-stock risk for broad-market risk in one transaction — instantly, not over a decade of selling.',
        pauseAfter: 550,
        scene: P('poolFund', 'e2-pool', {
          mode: 'swapped',
          title: 'The exchange fund — one pool, one hundred single stocks',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'When you eventually redeem, you receive a basket of diversified securities carrying your original, low cost basis. The gain is deferred until you sell those securities.',
        pauseAfter: 450,
        scene: P('poolFund', 'e2-pool', {
          mode: 'redeem',
          title: 'The exchange fund — one pool, one hundred single stocks',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'And if you hold until death, your heirs get a stepped-up basis — the deferred gain can be eliminated entirely. That estate-planning angle is the quiet superpower.',
        pauseAfter: 650,
        scene: P('poolFund', 'e2-pool', {
          mode: 'step-up',
          title: 'The exchange fund — one pool, one hundred single stocks',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'The catch is the seven years. To keep the tax treatment, you must stay in the fund for at least seven years — a rule built from Sections 704(c) and 737 to stop people using these as tax-free stock-swap machines.',
        pauseAfter: 450,
        voStyle: 'calm',
        scene: P('lockup', 'e2-lock', {
          title: 'The catch — seven years, or the deal unwinds',
        }),
      },
      {
        vo:
          'Leave early and you typically get your original contributed stock back — the exact concentration you were trying to escape — plus exit fees of one to two percent.',
        pauseAfter: 450,
        scene: P('lockup', 'e2-lock', {
          mode: 'early',
          title: 'The catch — seven years, or the deal unwinds',
        }),
      },
      {
        vo:
          'Some modern funds have no formal lock-up, but the economics of early exit are designed to hurt. This is not a parking spot. It is a marriage.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('lockup', 'e2-lock', {
          mode: 'marriage',
          title: 'The catch — seven years, or the deal unwinds',
        }),
      },
      {
        vo:
          'There is a second structural quirk. To qualify for the tax treatment, the fund cannot be a pure \u201cinvestment company\u201d — so it must hold at least twenty percent of assets in illiquid things like real estate.',
        pauseAfter: 450,
        scene: P('poolFund', 'e2-pool', {
          mode: 'illiquid',
          title: 'The second quirk — 20% of the pool is illiquid by rule',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'That is twenty percent of your money in assets you did not choose, added to satisfy a tax definition.',
        pauseAfter: 650,
        scene: P('poolFund', 'e2-pool', {
          mode: 'not-chosen',
          title: 'The second quirk — 20% of the pool is illiquid by rule',
          src: 'IRC \u00a7721; \u00a7704(c)(1)(B); \u00a7737',
        }),
      },
      {
        vo:
          'Now the real-world terms, because this is where the marketing and the math diverge. The legacy providers — Eaton Vance, Goldman Sachs — have historically required qualified-purchaser status, meaning five million in investments, with minimums around five hundred thousand to a million, and fees that can run from seventy basis points to two percent a year.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e2-terms', {
          title: 'Exchange-fund minimums and fees',
          bars: [
            { label: 'Legacy providers — minimum', value: 500000, tone: 'muted', tag: '$500K\u2013$1M · qualified purchaser ($5M)' },
            { label: 'Cache — minimum', value: 100000, tone: 'up', tag: 'accredited investors' },
          ],
          yMax: 600000,
          src: 'Cache product docs; Embark Funds 2026 guide; Morgan Stanley overview',
        }),
      },
      {
        vo:
          'The newer entrant, Cache, opened it to accredited investors at a hundred-thousand-dollar minimum, with fees starting at zero-point-nine-five percent and stepping down to zero-point-four-zero at twenty-five million.',
        pauseAfter: 550,
        scene: P('barsCompare', 'e2-terms', {
          title: 'Exchange-fund minimums and fees',
          bars: [
            { label: 'Legacy providers — fees', value: 200, tone: 'muted', tag: '70bp \u2013 200bp a year' },
            { label: 'Cache — fees', value: 95, tone: 'up', tag: '95bp \u2192 40bp at $25M' },
          ],
          yMax: 240,
          src: 'Cache product docs; Embark Funds 2026 guide; Morgan Stanley overview',
        }),
      },
      {
        vo:
          'And Cache publishes performance. Its UNIX fund, benchmarked to the Nasdaq-100, returned a net thirty-nine-point-three-two percent from its August 2024 inception through September 2025, versus twenty-seven-point-one-one for the index — twelve points of alpha.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e2-cache', {
          title: 'Cache UNIX vs Nasdaq-100 — provider-reported, Aug 2024\u2013Sep 2025',
          bars: [
            { label: 'Cache UNIX (net)', value: 39.32, tone: 'gold', tag: 'provider-reported' },
            { label: 'Nasdaq-100', value: 27.11, tone: 'muted', tag: 'the index' },
          ],
          yMax: 50,
          src: 'Cache Q3 2025 Official Results, provider-reported',
        }),
      },
      {
        vo:
          'Impressive. Now read the fine print with me. That is a provider-reported number on a track record barely a year long.',
        pauseAfter: 400,
        voStyle: 'calm',
        scene: P('barsCompare', 'e2-cache', {
          title: 'Cache UNIX vs Nasdaq-100 — provider-reported, Aug 2024\u2013Sep 2025',
          bars: [
            { label: 'Cache UNIX (net)', value: 39.32, tone: 'gold', tag: 'barely a year of track record' },
            { label: 'Nasdaq-100', value: 27.11, tone: 'muted', tag: 'the index' },
          ],
          yMax: 50,
          src: 'Cache Q3 2025 Official Results, provider-reported',
        }),
      },
      {
        vo:
          'And the outperformance came from early-quarter overweights in Nvidia, Apple, Broadcom and Google — the same mega-cap tech you already own. That is active risk-taking, not structural magic. It can reverse.',
        pauseAfter: 650,
        scene: P('barsCompare', 'e2-cache', {
          title: 'Cache UNIX vs Nasdaq-100 — provider-reported, Aug 2024\u2013Sep 2025',
          bars: [
            { label: 'Cache UNIX (net)', value: 39.32, tone: 'gold', tag: 'active overweights: NVDA · AAPL · AVGO · GOOGL' },
            { label: 'Nasdaq-100', value: 27.11, tone: 'muted', tag: 'the same mega-cap tech you already own' },
          ],
          yMax: 50,
          src: 'Cache Q3 2025 Official Results, provider-reported',
        }),
      },
      {
        vo:
          'The deeper issue is tracking error, and it is structural. The fund cannot freely sell the stocks investors contributed — selling would trigger tax for everyone. So the basket drifts from the index.',
        pauseAfter: 450,
        scene: P('driftChart', 'e2-drift', {
          title: 'Tracking error — the basket cannot sell, so it drifts',
          mode: 'drift',
        }),
      },
      {
        vo:
          'Contributed sectors stay overweight. Cache\u2019s own Q3 report shows its S&P fund running about one-point-six percent tracking error in its first quarter; the drift compounds over the seven years you are locked in.',
        pauseAfter: 450,
        scene: P('driftChart', 'e2-drift', {
          title: 'Tracking error — the basket cannot sell, so it drifts',
          mode: 'compounds',
        }),
      },
      {
        vo:
          'You are paying up to two percent a year for something that is not quite the index, cannot be customized, and cannot be left.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('driftChart', 'e2-drift', {
          title: 'Tracking error — the basket cannot sell, so it drifts',
          mode: 'punch',
        }),
      },
      {
        vo:
          'The kill conditions, straight from the advisor literature: you need liquidity inside seven years — wrong answer. Your stock has little embedded gain, so there is little tax to defer — wrong answer, the fees eat you.',
        pauseAfter: 400,
        voStyle: 'calm',
        scene: P('killCard', 'e2-kill', {
          mode: 'item-1',
          title: 'Exit 2 — the kill conditions',
        }),
      },
      {
        vo:
          'Or you have genuine, high conviction your stock beats the index for a decade — then concentration is a deliberate choice, and a broad-market fund is structurally the wrong tool.',
        pauseAfter: 600,
        scene: P('killCard', 'e2-kill', {
          mode: 'item-2',
          title: 'Exit 2 — the kill conditions',
        }),
      },
      {
        vo:
          'Right for: a large, highly appreciated position, no liquidity need for seven-plus years, and the humility to admit you do not know if your stock is the next Apple or the next Enron.',
        pauseAfter: 500,
        scene: P('host', 'e2-right', {
          headline: 'Large, appreciated,\nno liquidity need for seven years —',
          gesture: 'pointR',
          kicker: 'and the humility to admit you do not know',
        }),
      },
      {
        vo: 'That humility is the actual product.',
        pauseAfter: 800,
        voStyle: 'reveal',
        scene: P('bigText', 'e2-punch', {
          lines: ['The humility', 'is the product.'],
        }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // EXIT 3 — direct indexing
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'exit3',
    title: 'Exit 3 — Direct indexing: tax alpha or expensive ETF?',
    beats: [
      {
        vo:
          'Direct indexing means owning the individual stocks of an index in your own account, instead of one fund share. Same exposure.',
        pauseAfter: 450,
        scene: P('explodeGrid', 'e3-explode', {
          mode: 'intro',
          title: 'Direct indexing — one fund share becomes 500 line items',
          src: 'IRC \u00a71091 wash-sale rule',
        }),
      },
      {
        vo:
          'But now you can harvest losses one stock at a time. In any given year, even when the index is up, some constituents are down.',
        pauseAfter: 450,
        scene: P('explodeGrid', 'e3-explode', {
          mode: 'losers',
          title: 'Direct indexing — one fund share becomes 500 line items',
          src: 'IRC \u00a71091 wash-sale rule',
        }),
      },
      {
        vo:
          'You sell the losers, book the loss, and buy a similar — not \u201csubstantially identical\u201d — replacement to stay invested.',
        pauseAfter: 450,
        scene: P('explodeGrid', 'e3-explode', {
          mode: 'harvest',
          title: 'Direct indexing — one fund share becomes 500 line items',
          src: 'IRC \u00a71091 wash-sale rule',
        }),
      },
      {
        vo:
          'Those losses offset the capital gains you generate selling your concentrated position. That is the entire pitch: manufacture a stream of tax losses to pay for your diversification.',
        pauseAfter: 600,
        scene: P('explodeGrid', 'e3-explode', {
          mode: 'offset',
          title: 'Direct indexing — one fund share becomes 500 line items',
          src: 'IRC \u00a71091 wash-sale rule',
        }),
      },
      {
        vo:
          'The mechanics live and die by the wash-sale rule. Sell a stock at a loss, and you cannot buy it back for thirty-one days without disallowing the loss. So the manager swaps in a correlated substitute and waits.',
        pauseAfter: 450,
        scene: P('explodeGrid', 'e3-explode', {
          mode: 'wash',
          title: 'The wash-sale rule — 31 days, or the loss dies',
          src: 'IRC \u00a71091 wash-sale rule',
        }),
      },
      {
        vo:
          'Do this across hundreds of names, year-round, and you get what the industry calls \u201ctax alpha.\u201d',
        pauseAfter: 600,
        scene: P('explodeGrid', 'e3-explode', {
          mode: 'alpha',
          title: 'The wash-sale rule — 31 days, or the loss dies',
          src: 'IRC \u00a71091 wash-sale rule',
        }),
      },
      {
        vo:
          'It is not a niche. Cerulli counted eight hundred sixty-four billion dollars in direct-indexing assets at the end of 2024 — nearly double 2021.',
        pauseAfter: 450,
        scene: P('statCards', 'e3-scale', {
          cards: [
            { big: '$864B', label: 'direct-indexing assets, end of 2024', tag: 'nearly double 2021', tone: 'gold' },
            { big: '83%', label: 'of advisors using it or planning to within 12 months', tag: 'FTSE Russell 2026 survey', tone: 'up' },
          ],
        }),
      },
      {
        vo:
          'FTSE Russell\u2019s 2026 survey found eighty-three percent of advisors using it or planning to within twelve months.',
        pauseAfter: 550,
        scene: P('statCards', 'e3-scale', {
          cards: [
            { big: '83%', label: 'of advisors using it or planning to within 12 months', tag: 'FTSE Russell 2026 survey', tone: 'up' },
            { big: '$864B', label: 'direct-indexing assets, end of 2024', tag: 'Cerulli Associates, April 2025', tone: 'gold' },
          ],
        }),
      },
      {
        vo:
          'Now the other side, and this is where most YouTube videos stop selling and start thinking. The tax alpha is real but modest, front-loaded, and assumption-dependent.',
        pauseAfter: 450,
        voStyle: 'calm',
        scene: P('host', 'e3-turn', {
          headline: 'Real, but modest,\nfront-loaded, assumption-dependent',
          gesture: 'serious',
          kicker: 'where most videos stop selling and start thinking',
        }),
      },
      {
        vo:
          'Published estimates land in the low single digits of percent per year — biggest in the early years and in choppy markets, shrinking as the account appreciates and fewer positions sit below basis.',
        pauseAfter: 450,
        scene: P('decayCurves', 'e3-decay', {
          title: 'Harvested losses — biggest early, shrinking as the account appreciates',
          mode: 'decay',
        }),
      },
      {
        vo:
          'Frec\u2019s own simulation models about fourteen-point-seven percent of capital harvested as losses in year one, tapering toward forty percent cumulative over a decade. Those are hypothetical, provider-modeled numbers.',
        pauseAfter: 600,
        scene: P('decayCurves', 'e3-decay', {
          title: 'Harvested losses — biggest early, shrinking as the account appreciates',
          mode: 'frec',
          src: 'Frec, \u201cIs the tax alpha worth the fee?\u201d, Oct 2026',
        }),
      },
      {
        vo:
          'And the fee is the variable that decides everything. Legacy providers charged sixty to a hundred-ten basis points, sometimes more — and you pay those fees with after-tax dollars, because individual investment-advisory fees are not deductible.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e3-fees', {
          title: 'The fee is the variable that decides everything',
          bars: [
            { label: 'Legacy providers', value: 110, tone: 'down', tag: '60\u2013110bp+, paid with after-tax dollars' },
            { label: 'Schwab Personalized', value: 40, tone: 'muted', tag: '40bp starting' },
            { label: 'Frec', value: 9, tone: 'up', tag: '9bp, $20K minimum' },
          ],
          yMax: 130,
          src: 'Frec; Schwab Personalized Indexing',
        }),
      },
      {
        vo:
          'Elm Wealth\u2019s analysis is blunt: at legacy pricing, the fees can consume the tax benefit entirely.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e3-fees', {
          title: 'The fee is the variable that decides everything',
          bars: [
            { label: 'Legacy providers', value: 110, tone: 'down', tag: 'fees can consume the tax benefit entirely' },
            { label: 'Schwab Personalized', value: 40, tone: 'muted', tag: '40bp starting' },
            { label: 'Frec', value: 9, tone: 'up', tag: '9bp, $20K minimum' },
          ],
          yMax: 130,
          src: 'Elm Wealth, \u201cIs the Juice Worth the Squeeze?\u201d, 2024',
        }),
      },
      {
        vo:
          'Their April 2026 follow-up on levered long/short direct indexing found fees ate more than half the tax benefit over a twenty-year model.',
        pauseAfter: 600,
        scene: P('statCards', 'e3-elm', {
          cards: [
            { big: '>50%', label: 'of the tax benefit consumed by fees over a 20-year model', tag: 'at legacy pricing', tone: 'down' },
            { big: '9bp', label: 'changes the proposition entirely', tag: 'Frec, 2026', tone: 'up' },
          ],
        }),
      },
      {
        vo:
          'But here is the 2026 update the old articles miss: fee compression. Frec now charges as little as zero-point-zero-nine percent with a twenty-thousand-dollar minimum. Schwab\u2019s Personalized Indexing starts at zero-point-four-zero. The strategy that was a fee trap at one percent is a different proposition at nine basis points.',
        pauseAfter: 650,
        scene: P('barsCompare', 'e3-fees', {
          title: 'The 2026 update — fee compression',
          bars: [
            { label: 'Legacy providers', value: 110, tone: 'down', tag: 'the old fee trap' },
            { label: 'Schwab Personalized', value: 40, tone: 'muted', tag: '40bp starting' },
            { label: 'Frec', value: 9, tone: 'up', tag: '9bp · $20K minimum — a different proposition' },
          ],
          yMax: 130,
          src: 'Frec; Schwab Personalized Indexing',
        }),
      },
      {
        vo:
          'So here is the napkin test — write this down. Your extra fee, divided by your marginal tax rate, equals the losses you must harvest just to break even.',
        pauseAfter: 450,
        voStyle: 'reveal',
        scene: P('napkin', 'e3-napkin', {
          title: 'The napkin test',
          formula: ['extra fee', '\u00f7', 'marginal tax rate', '=', 'losses to break even'],
        }),
      },
      {
        vo:
          'On a million dollars, a nine-basis-point fee versus a three-basis-point ETF is a six-hundred-dollar gap. At a thirty-five percent rate, you need about seventeen hundred dollars of usable losses a year to cover it.',
        pauseAfter: 450,
        scene: P('napkin', 'e3-napkin', {
          title: 'The napkin test — $1M account',
          formula: ['$600 fee gap', '\u00f7', '35%', '=', '\u2248 $1,700 of usable losses a year'],
        }),
      },
      {
        vo:
          'Harvest more than that, and the fee pays for itself. The word \u201cusable\u201d carries the weight — a loss only helps if you have gains to offset, or you use the three-thousand-dollar ordinary-income allowance; the rest carries forward.',
        pauseAfter: 650,
        scene: P('napkin', 'e3-napkin', {
          title: 'The napkin test — \u201cusable\u201d carries the weight',
          formula: ['harvest more than the break-even', '\u2192', 'the fee pays for itself'],
          note: 'unused losses carry forward · $3,000 ordinary-income allowance',
          src: 'Frec break-even framework; IRS Topic 409',
        }),
      },
      {
        vo:
          'Kill conditions: you have no regular capital gains to offset — the losses become a carryforward museum. The account is an IRA — tax-loss harvesting is worthless there. You are cost-sensitive and the fee gap is wide. Or you want low maintenance — managing hundreds of positions and wash-sale windows is not low maintenance.',
        pauseAfter: 650,
        voStyle: 'calm',
        scene: P('killCard', 'e3-kill', {
          mode: 'item-1',
          title: 'Exit 3 — the kill conditions',
        }),
      },
      {
        vo:
          'And one structural critique worth knowing: an S&P 500 direct index owns today\u2019s five hundred largest companies. Bessembinder\u2019s four-percent finding means the next generation of wealth creators will not all come from today\u2019s index members.',
        pauseAfter: 450,
        scene: P('host', 'e3-critique', {
          headline: 'Today\u2019s index owns\ntoday\u2019s winners —',
          verb: 'card', gesture: 'serious',
          kicker: 'the next generation of wealth creators is not in it yet',
        }),
      },
      {
        vo:
          'A segmented basket of low-cost sector and international ETFs can generate similar losses with broader coverage and less tracking error. The \u201csophisticated\u201d choice is not automatically the better one.',
        pauseAfter: 700,
        scene: P('host', 'e3-critique', {
          headline: 'The \u201csophisticated\u201d choice\nis not automatically better',
          gesture: 'leanIn',
          kicker: 'a segmented ETF basket can match the losses',
        }),
      },
      {
        vo:
          'Notice what just happened. The advanced strategy might be worse than a three-basis-point ETF. The next one is worse than that in a bull market — and it once saved Mark Cuban a billion dollars. Both things are true. Let me show you.',
        pauseAfter: 800,
        voStyle: 'quote',
        scene: P('exitTiles', 'e3-out', { mode: 'spot-4' }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // EXIT 4 — protective collars
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'exit4',
    title: 'Exit 4 — Protective collars: the Cuban trade & its fine print',
    beats: [
      {
        vo:
          'April 1999. Yahoo buys Mark Cuban\u2019s Broadcast.com for five-point-seven billion dollars in stock. Cuban receives fourteen-point-six million Yahoo shares, worth about one-point-four billion at ninety-five dollars a share.',
        pauseAfter: 450,
        scene: P('quoteCard', 'e4-deal', {
          kicker: 'April 1999 — the lock-up',
          lines: ['14.6M Yahoo shares.', '$1.4B at $95.', 'Unsellable.'],
          soft: false,
          src: 'Business Insider / Real Vision interview, June 2020',
        }),
      },
      {
        vo:
          'He cannot sell immediately — lock-up. And he thinks the market is insane.',
        pauseAfter: 400,
        scene: P('quoteCard', 'e4-deal', {
          kicker: 'April 1999 — the lock-up',
          lines: ['\u201cI was like,', 'it is going to happen again.\u201d'],
          soft: false,
          src: 'Business Insider / Real Vision interview, June 2020',
        }),
      },
      {
        vo:
          'So he goes to Goldman Sachs and builds a collar. He buys put options with an eighty-five-dollar strike — a floor, the right to sell at eighty-five no matter how far the stock falls.',
        pauseAfter: 450,
        scene: P('payoffDiagram', 'e4-collar', {
          mode: 'floor',
          title: 'The collar — Cuban, Yahoo, 1999',
          src: 'Business Insider / Real Vision interview, June 2020',
        }),
      },
      {
        vo:
          'He sells call options with a two-hundred-and-five-dollar strike — a ceiling, an obligation to sell at two-oh-five if it rockets. The premium he collects from the calls pays for the puts. Net cost: approximately zero.',
        pauseAfter: 500,
        scene: P('payoffDiagram', 'e4-collar', {
          mode: 'ceiling',
          title: 'The collar — Cuban, Yahoo, 1999',
          src: 'Business Insider / Real Vision interview, June 2020',
        }),
      },
      {
        vo:
          'He could not even put the collar on for six months, so he bought puts outright first — quote, \u201cliterally every single penny I had.\u201d',
        pauseAfter: 550,
        voStyle: 'quote',
        scene: P('quoteCard', 'e4-puts', {
          kicker: 'Mark Cuban, on the six months before the collar',
          lines: ['\u201cLiterally every', 'single penny I had.\u201d'],
          soft: false,
        }),
      },
      {
        vo:
          'Yahoo went above two-thirty by January 2000. Cuban\u2019s ceiling capped his upside — he \u201clost\u201d the rally above two-oh-five. Then the bubble burst and Yahoo collapsed. His floor held.',
        pauseAfter: 450,
        scene: P('payoffDiagram', 'e4-path', {
          mode: 'path',
          title: 'Yahoo 1999\u20132002 — capped upside, held floor',
          src: 'Business Insider / Real Vision interview, June 2020',
        }),
      },
      {
        vo:
          'Quote: \u201cMy hedge worked out perfectly.\u201d The collar did not make him rich. It kept him rich.',
        pauseAfter: 450,
        voStyle: 'quote',
        scene: P('quoteCard', 'e4-hedge', {
          kicker: 'Mark Cuban',
          lines: ['\u201cMy hedge worked', 'out perfectly.\u201d'],
          soft: false,
        }),
      },
      {
        vo:
          'That is the entire purpose of this tool: convert an unbounded outcome into a known range. You are not buying return. You are buying a floor.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('bigText', 'e4-purpose', {
          lines: ['You are not buying return.', 'You are buying a floor.'],
        }),
      },
      {
        vo:
          'Now the cost, because a collar is not free just because the premium nets to zero. The cost is the upside you surrender. And in a sustained bull market, that cost is enormous.',
        pauseAfter: 550,
        scene: P('payoffDiagram', 'e4-path', {
          mode: 'cost',
          title: 'The cost — the upside you surrender',
          src: 'PortfoliosLab total-return data; Global X XCLR',
        }),
      },
      {
        vo:
          'Look at the Global X S&P 500 Collar 95-110 ETF — a real, listed fund that mechanically collars the index. In 2022 it lost twelve-point-nine percent while the S&P lost eighteen-point-two. The floor worked.',
        pauseAfter: 450,
        scene: P('crossChart', 'e4-xclr', {
          title: 'XCLR vs SPY — the floor works, the rally costs',
          mode: 'xclr-2022',
          src: 'PortfoliosLab total-return data; Global X XCLR',
        }),
      },
      {
        vo:
          'But over the full 2022-through-2025 cycle it returned roughly thirty-four percent against the S&P\u2019s fifty-two. The insurance paid out in the bear market and then charged you the rally as its premium.',
        pauseAfter: 450,
        scene: P('crossChart', 'e4-xclr', {
          title: 'XCLR vs SPY — 2022\u20132025: +34% vs +52%',
          mode: 'xclr-cycle',
          src: 'PortfoliosLab total-return data; Global X XCLR',
        }),
      },
      {
        vo:
          'A collar is a tactical bridge, not a destination.',
        pauseAfter: 650,
        voStyle: 'reveal',
        scene: P('stampCard', 'e4-bridge', {
          stamp: 'A BRIDGE',
          sub: 'not a destination',
        }),
      },
      {
        vo:
          'Then the tax minefield, and this is where people get hurt. First, constructive sales. Under Section 1259, if your hedge eliminates substantially all of your risk of loss and opportunity for gain, the IRS treats it as if you sold the stock — immediate tax on the entire embedded gain, the exact thing you were avoiding.',
        pauseAfter: 450,
        voStyle: 'calm',
        scene: P('taxMine', 'e4-mine', {
          mode: 's1259',
          title: 'The tax minefield — constructive sales',
          src: 'IRC \u00a71259 constructive sales; \u00a71092 straddle rules',
        }),
      },
      {
        vo:
          'There is no official safe harbor. Practitioners often want a band of roughly fifteen percent or more between floor and ceiling, but that is a rule of thumb, not law. It is facts-and-circumstances, and it carries audit risk.',
        pauseAfter: 500,
        scene: P('taxMine', 'e4-mine', {
          mode: 'band',
          title: 'The tax minefield — constructive sales',
          src: 'IRC \u00a71259 constructive sales; \u00a71092 straddle rules',
        }),
      },
      {
        vo:
          'Second, the straddle rules under Section 1092. If your call expires unexercised, the premium you collected is short-term capital gain — taxable now. But the cost of your expired put, the loss, can be deferred until you close the whole position.',
        pauseAfter: 450,
        scene: P('taxMine', 'e4-mine', {
          mode: 's1092',
          title: 'The tax minefield — the straddle whipsaw',
          src: 'IRC \u00a71259 constructive sales; \u00a71092 straddle rules',
        }),
      },
      {
        vo:
          'You can owe tax on the income while being barred from deducting the matching expense. Practitioners call it the whipsaw.',
        pauseAfter: 450,
        scene: P('taxMine', 'e4-mine', {
          mode: 'whipsaw',
          title: 'The tax minefield — the straddle whipsaw',
          src: 'IRC \u00a71259 constructive sales; \u00a71092 straddle rules',
        }),
      },
      {
        vo:
          'Some use a single over-the-counter contract combining both legs to mitigate this — which introduces dealer counterparty risk that listed, OCC-cleared options do not carry.',
        pauseAfter: 600,
        scene: P('taxMine', 'e4-mine', {
          mode: 'otc',
          title: 'The tax minefield — the straddle whipsaw',
          src: 'IRC \u00a71259 constructive sales; \u00a71092 straddle rules',
        }),
      },
      {
        vo:
          'And the practical killer: most public-company insider-trading policies explicitly prohibit executives from hedging company stock at all. Before you model a single strike price, read your company\u2019s policy. For many of you, this exit is locked from the inside.',
        pauseAfter: 750,
        scene: P('stampCard', 'e4-policy', {
          stamp: 'LOCKED',
          sub: 'most insider policies prohibit hedging — read yours first',
        }),
      },
      {
        vo:
          'Kill conditions: you are bullish — you will resent the ceiling every day. You need long-term diversification — a collar hedges, it does not diversify. Your employer prohibits hedging. Or you cannot tolerate the tax complexity.',
        pauseAfter: 650,
        voStyle: 'calm',
        scene: P('killCard', 'e4-kill', {
          mode: 'item-1',
          title: 'Exit 4 — the kill conditions',
        }),
      },
      {
        vo:
          'Right for: a highly convicted holder of a volatile stock, who needs a floor for a defined window — say, while waiting out a lock-up or an election — whose employer permits it, and who understands they are renting protection, not owning a solution.',
        pauseAfter: 700,
        scene: P('host', 'e4-right', {
          headline: 'A floor for\na defined window —',
          gesture: 'count2',
          kicker: 'renting protection, not owning a solution',
        }),
      },
      {
        vo:
          'Which brings us to the only strategy that can make the capital-gains tax disappear entirely. And the reason you can never get the money back.',
        pauseAfter: 800,
        voStyle: 'reveal',
        scene: P('host', 'e4-out', {
          headline: 'The only strategy that makes\nthe tax disappear entirely —',
          gesture: 'close',
          kicker: 'and the reason you can never get the money back',
        }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // EXIT 5 — charitable vehicles
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'exit5',
    title: 'Exit 5 — Charitable vehicles: the best math you cannot undo',
    beats: [
      {
        vo:
          'Here is the mechanism that beats everything else on after-tax dollars, if — and only if — you were going to give anyway.',
        pauseAfter: 500,
        scene: P('host', 'e5-intro', {
          headline: 'The best math —\nif you were going to give anyway',
          kicker: 'exit 5 — charitable vehicles',
        }),
      },
      {
        vo:
          'You donate appreciated stock directly to a charitable vehicle. You do not sell it first. The vehicle sells it, and because it is tax-exempt, no capital-gains tax is triggered.',
        pauseAfter: 450,
        scene: P('flowCharity', 'e5-flow', {
          mode: 'daf-intro',
          title: 'The mechanism — donate the shares, never the cash',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'The full pre-tax value goes to work. You also get an income-tax deduction. The gain you spent years deferring is not deferred. It is gone.',
        pauseAfter: 550,
        voStyle: 'reveal',
        scene: P('flowCharity', 'e5-flow', {
          mode: 'gain-gone',
          title: 'The mechanism — donate the shares, never the cash',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'Two structures. A donor-advised fund is the simple one: an account at a public charity — Fidelity, Schwab, Vanguard. You contribute the stock, take an immediate deduction at fair market value, the fund sells tax-free, and you recommend grants over time.',
        pauseAfter: 450,
        scene: P('flowCharity', 'e5-daf', {
          mode: 'daf',
          title: 'Structure one — the donor-advised fund',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'No income stream back to you. It is a charitable checking account with a tax engine.',
        pauseAfter: 550,
        scene: P('flowCharity', 'e5-daf', {
          mode: 'daf-note',
          title: 'Structure one — the donor-advised fund',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'A charitable remainder trust is the complex one. Irrevocable. You fund it with the stock; it sells tax-free and reinvests the full proceeds; it pays you an income stream for a term of years or for life; and whatever remains at the end goes to charity.',
        pauseAfter: 450,
        scene: P('flowCharity', 'e5-crt', {
          mode: 'crt',
          title: 'Structure two — the charitable remainder trust',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'You get a deduction now for the present value of that future remainder — calculated using the IRS Section 7520 rate, which as of November 2026 sits around six percent, high by post-2008 standards, and a higher rate means a bigger deduction.',
        pauseAfter: 500,
        scene: P('flowCharity', 'e5-crt', {
          mode: 's7520',
          title: 'Structure two — the charitable remainder trust',
          src: 'IRS \u00a77520 rates, Rev. Rul. 2026-21',
        }),
      },
      {
        vo:
          'The income you receive is taxed in a specific order: ordinary income first, then capital gains, then tax-free income, then return of principal. And the trust must pass a ten-percent minimum-remainder test and avoid unrelated-business taxable income — which means no borrowing on margin inside it.',
        pauseAfter: 650,
        scene: P('flowCharity', 'e5-crt', {
          mode: 'ordering',
          title: 'Structure two — the charitable remainder trust',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'Now the numbers, with the assumptions stated, because this is a vendor illustration and I will label it as one. Valur models a thirty-five-year-old in California with a one-million-dollar, zero-basis asset, a thirty-five percent tax rate, and ten-percent annual market growth.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e5-valur', {
          title: 'Valur\u2019s model — $1M zero-basis asset, 35% bracket, 10% growth',
          bars: [
            { label: 'No planning (NPV, 10 yrs)', value: 1.37, tone: 'muted', tag: 'illustrative — a vendor model' },
            { label: 'Exchange fund', value: 1.59, tone: 'up', tag: '' },
            { label: 'Charitable remainder trust', value: 2.15, tone: 'gold', tag: 'wins by a wide margin' },
          ],
          yMax: 2.6,
          src: 'Valur, updated Nov 2026 — illustrative',
        }),
      },
      {
        vo:
          'After ten years, on a net-present-value basis: no tax planning, about one-point-three-seven million. An exchange fund, about one-point-five-nine. A charitable remainder trust, about two-point-one-five. The CRT wins by a wide margin — lower cost structure, longer deferral, plus the deduction.',
        pauseAfter: 700,
        scene: P('barsCompare', 'e5-valur', {
          title: 'Valur\u2019s model — $1M zero-basis asset, 35% bracket, 10% growth',
          bars: [
            { label: 'No planning (NPV, 10 yrs)', value: 1.37, tone: 'muted', tag: '$1.37M' },
            { label: 'Exchange fund', value: 1.59, tone: 'up', tag: '$1.59M' },
            { label: 'Charitable remainder trust', value: 2.15, tone: 'gold', tag: '$2.15M — wins by a wide margin' },
          ],
          yMax: 2.6,
          src: 'Valur, updated Nov 2026 — illustrative',
        }),
      },
      {
        vo:
          'But read what \u201cwins\u201d means. The remainder — the principal that did not get paid out to you — goes to charity. Permanently.',
        pauseAfter: 500,
        voStyle: 'calm',
        scene: P('flowCharity', 'e5-flow', {
          mode: 'remainder',
          title: 'What \u201cwins\u201d means — the remainder goes to charity. Permanently.',
          src: 'IRC \u00a7664; \u00a7170; \u00a77520',
        }),
      },
      {
        vo:
          'This is not a tax trick that lets you keep the money. It is the optimal way to give money you had already decided to give. If you do not have genuine philanthropic intent, the CRT is not the best strategy. It is a one-way door you should not walk through.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('bigText', 'e5-door', {
          lines: ['A one-way door.', 'Do not walk through', 'without intent.'],
        }),
      },
      {
        vo:
          'And here is the 2026 change almost nobody is pricing in. The One Big Beautiful Bill Act added, starting this year, a half-percent-of-AGI floor on itemized charitable deductions — you lose the deduction on the first half-percent of your adjusted gross income.',
        pauseAfter: 450,
        scene: P('ruleChange', 'e5-obbba', {
          mode: 'floor',
          title: 'The 2026 change — OBBBA re-prices giving',
          src: 'OBBBA 2025; Fidelity Charitable; Journal of Accountancy, Oct 2025',
        }),
      },
      {
        vo:
          'And for taxpayers in the thirty-seven-percent bracket, the value of itemized charitable deductions is capped at thirty-five cents on the dollar, not thirty-seven. The deduction got slightly less valuable exactly as these strategies got more popular.',
        pauseAfter: 450,
        scene: P('ruleChange', 'e5-obbba', {
          mode: 'cap',
          title: 'The 2026 change — OBBBA re-prices giving',
          src: 'OBBBA 2025; Fidelity Charitable; Journal of Accountancy, Oct 2025',
        }),
      },
      {
        vo:
          'The appreciated-asset deduction is still generally limited to thirty percent of AGI, with a five-year carryforward. Model the current rules, not the 2023 blog post.',
        pauseAfter: 650,
        scene: P('ruleChange', 'e5-obbba', {
          mode: 'limits',
          title: 'The 2026 change — OBBBA re-prices giving',
          src: 'OBBBA 2025; Fidelity Charitable; Journal of Accountancy, Oct 2025',
        }),
      },
      {
        vo:
          'Two more traps. The contribution is irrevocable — once it is in, it is out of your estate, forever. And timing: if you donate stock that is already subject to a binding sale agreement, the IRS can invoke the anticipatory-assignment-of-income doctrine and tax you on the sale anyway.',
        pauseAfter: 450,
        scene: P('killCard', 'e5-traps', {
          mode: 'item-1',
          title: 'Exit 5 — the traps',
        }),
      },
      {
        vo:
          'Donate before a liquidity event is legally locked, and get a qualified appraisal for non-public stock.',
        pauseAfter: 600,
        scene: P('killCard', 'e5-traps', {
          mode: 'item-2',
          title: 'Exit 5 — the traps',
        }),
      },
      {
        vo:
          'Kill conditions: no real philanthropic intent. You might need the principal. You want flexibility. Any of those, and this is the wrong door.',
        pauseAfter: 700,
        voStyle: 'calm',
        scene: P('killCard', 'e5-kill', {
          mode: 'item-1',
          title: 'Exit 5 — the kill conditions',
        }),
      },
      {
        vo:
          'One aside for the founders watching, because it can dwarf everything else in this video. If your stock is private and qualifies as Qualified Small Business Stock under Section 1202, the 2025 law created tiered exclusions for stock acquired after July fourth, 2025: fifty percent of the gain excluded at three years, seventy-five at four, a hundred at five.',
        pauseAfter: 450,
        scene: P('ruleChange', 'e5-qsbs', {
          mode: 'qsbs',
          title: 'The founders\u2019 aside — QSBS \u00a71202, the 2025 tiers',
          src: 'OBBBA 2025; Holland & Knight, July 2025',
        }),
      },
      {
        vo:
          'With a fifteen-million-dollar per-issuer cap and a seventy-five-million-dollar gross-asset test. Older stock keeps the old ten-million, five-year, hundred-percent regime. If you qualify, read Section 1202 before you read anything else. It can make the entire tax question vanish.',
        pauseAfter: 800,
        scene: P('ruleChange', 'e5-qsbs', {
          mode: 'qsbs-2',
          title: 'The founders\u2019 aside — QSBS \u00a71202, the 2025 tiers',
          src: 'OBBBA 2025; Holland & Knight, July 2025',
        }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // EXIT 6 — levered long/short
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'exit6',
    title: 'Exit 6 — Levered long/short: the family-office tool',
    beats: [
      {
        vo:
          'The last exit is the one your family office whispers about. A levered long/short program synthetically replaces your concentrated position with broad-market exposure, using leverage.',
        pauseAfter: 500,
        scene: P('lsLeverage', 'e6-ls', {
          mode: 'intro',
          title: 'The levered long/short — the family-office tool',
          src: 'J. Asset Management, July 2025; BlackRock',
        }),
      },
      {
        vo:
          'You run a long extension — additional securities bought with borrowed funds — and a short extension — borrowed securities sold — constructed to track an index while generating losses that offset the gains from unwinding your stock.',
        pauseAfter: 450,
        scene: P('lsLeverage', 'e6-ls', {
          mode: 'extensions',
          title: 'The levered long/short — the family-office tool',
          src: 'J. Asset Management, July 2025; BlackRock',
        }),
      },
      {
        vo:
          'The 130/30 version runs a hundred-thirty percent long, thirty short. The aggressive 200/100 runs two hundred long, a hundred short. The goal: tax-neutral diversification, fast.',
        pauseAfter: 650,
        scene: P('lsLeverage', 'e6-ls', {
          mode: 'ratios',
          title: '130/30 — and the aggressive 200/100',
          src: 'J. Asset Management, July 2025; BlackRock',
        }),
      },
      {
        vo:
          'The evidence is the best of any strategy here, because it is peer-reviewed and open-access. BlackRock\u2019s researchers ran three hundred and eighty ten-year historical paths.',
        pauseAfter: 450,
        scene: P('host', 'e6-evidence', {
          headline: 'The best evidence\nof any strategy here —',
          gesture: 'pointR',
          kicker: 'peer-reviewed, open-access, 380 ten-year paths',
        }),
      },
      {
        vo:
          'The 200/100 program reduced the concentrated position\u2019s active weight to five percent or less on one hundred percent of paths by year ten — and ninety-one percent by year five.',
        pauseAfter: 450,
        scene: P('decayCurves', 'e6-decay', {
          title: 'Active weight \u2264 5% — the race to diversification',
          mode: 'ls200',
          src: '\u201cLoss harvesting strategies\u2026\u201d, J. Asset Management 26:447\u2013463, 2025',
        }),
      },
      {
        vo:
          'A slow, sell-five-percent-a-year gains-budget approach hit that target on only twenty-two percent of paths by year ten.',
        pauseAfter: 450,
        scene: P('decayCurves', 'e6-decay', {
          title: 'Active weight \u2264 5% — the race to diversification',
          mode: 'gb5',
          src: '\u201cLoss harvesting strategies\u2026\u201d, J. Asset Management 26:447\u2013463, 2025',
        }),
      },
      {
        vo:
          'Tracking error fell below five percent on every path by year three. And the average after-tax active return versus simply holding the stock was positive one-point-three-four percent a year — net of transaction costs, financing, and management fees. Cumulative tax drag over the decade: effectively zero.',
        pauseAfter: 700,
        scene: P('statCards', 'e6-numbers', {
          cards: [
            { big: '+1.34%', label: 'average after-tax active return per year', tag: 'net of costs, financing, fees', tone: 'up' },
            { big: '100%', label: 'of paths diversified to \u22645% active weight by year 10', tag: 'LS 200/100', tone: 'gold' },
            { big: '\u22480', label: 'cumulative tax drag over the decade', tag: '', tone: 'up' },
          ],
        }),
      },
      {
        vo:
          'Now the cost, and I am going to correct a number that appears in some summaries of this research. The deferral is not forgiveness.',
        pauseAfter: 500,
        voStyle: 'calm',
        scene: P('host', 'e6-correct', {
          headline: 'The correction:\nthe deferral is not forgiveness',
          gesture: 'aha',
          kicker: 'the number some summaries get wrong',
        }),
      },
      {
        vo:
          'In the published results, liquidating the 200/100 portfolio at the ten-year mark cost a median of about twenty-one-and-a-half percent of the portfolio\u2019s pre-liquidation value in tax — versus about fifteen-point-eight percent for the pay-as-you-go approach.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e6-exit', {
          title: 'The exit tax — a stream of bills, or one lump',
          bars: [
            { label: 'LS 200/100 at year 10', value: 21.5, tone: 'down', tag: 'median tax at liquidation' },
            { label: 'Pay-as-you-go', value: 15.8, tone: 'muted', tag: 'the gains-budget approach' },
          ],
          yMax: 26,
          src: 'J. Asset Management, July 2025 — published tables',
        }),
      },
      {
        vo:
          'You traded a stream of small tax bills for one large one at the exit. The strategy that defers the most tax tends to owe the most at the end.',
        pauseAfter: 450,
        scene: P('barsCompare', 'e6-exit', {
          title: 'The exit tax — a stream of bills, or one lump',
          bars: [
            { label: 'LS 200/100 at year 10', value: 21.5, tone: 'down', tag: 'one large bill at the exit' },
            { label: 'Pay-as-you-go', value: 15.8, tone: 'muted', tag: 'a stream of small bills' },
          ],
          yMax: 26,
          src: 'J. Asset Management, July 2025 — published tables',
        }),
      },
      {
        vo:
          'And if you bequeath or donate the portfolio, that exit tax can be zero — which loops us right back to the estate and charitable exits.',
        pauseAfter: 600,
        scene: P('host', 'e6-correct', {
          headline: 'Bequeath it, donate it —\nthe exit tax can be zero',
          kicker: 'which loops back to exits 5 and the estate',
        }),
      },
      {
        vo:
          'The paper\u2019s own case study is the most honest thing in it. From 2007 to 2017, the slow gains-budget approach could not diversify Apple — the stock rose so fast that after ten years it was still eighty percent of the position.',
        pauseAfter: 450,
        scene: P('appleCase', 'e6-apple', {
          mode: 'slow',
          title: 'The case study — Apple, 2007\u20132017',
          src: 'J. Asset Management, July 2025 — the case study',
        }),
      },
      {
        vo:
          'The fast long/short program had Apple down to about one percent within two years. With hindsight, the Apple holder would call that rapid diversification a calamity.',
        pauseAfter: 450,
        scene: P('appleCase', 'e6-apple', {
          mode: 'fast',
          title: 'The case study — Apple, 2007\u20132017',
          src: 'J. Asset Management, July 2025 — the case study',
        }),
      },
      {
        vo:
          'The authors\u2019 point, and it is the point of this entire video: Apple\u2019s run was a rare event, impossible to forecast at the start. You do not get to know which stock you are holding. You get to choose how much of your future depends on finding out.',
        pauseAfter: 700,
        voStyle: 'reveal',
        scene: P('bigText', 'e6-point', {
          lines: ['You do not get to know', 'which stock you are holding.'],
        }),
      },
      {
        vo:
          'And the leverage is not free. Financing costs erode returns. Elm Wealth\u2019s twenty-year model found fees consumed more than half the tax benefit.',
        pauseAfter: 450,
        scene: P('host', 'e6-leverage', {
          headline: 'The leverage\nis not free —',
          gesture: 'think',
          kicker: 'financing costs erode returns; fees ate half the benefit in Elm\u2019s model',
        }),
      },
      {
        vo:
          'This is a tool for sophisticated investors who can tolerate leverage, complexity, and a large exit tax — and who have the scale to negotiate the fee line down, because at this level the fee line matters more than the strategy line.',
        pauseAfter: 650,
        scene: P('host', 'e6-leverage', {
          headline: 'The fee line matters\nmore than the strategy line',
          gesture: 'shrug',
          kicker: 'at this level',
        }),
      },
      {
        vo:
          'Kill conditions: you are leverage-averse. You are fee-sensitive. You cannot tolerate the complexity or the exit-tax lump. Then the simple sale — the benchmark this whole video keeps returning to — is your answer, and there is no shame in it.',
        pauseAfter: 800,
        voStyle: 'calm',
        scene: P('killCard', 'e6-kill', {
          mode: 'item-1',
          title: 'Exit 6 — the kill conditions',
        }),
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // THE FRAMEWORK
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'framework',
    title: 'The decision framework + the only question that matters',
    beats: [
      {
        vo:
          'So here is the framework. Six tools, not a menu of interchangeable options — a toolkit where each instrument has one job and one kill condition.',
        pauseAfter: 500,
        voStyle: 'reveal',
        scene: P('decisionTable', 'fw-table', {
          mode: 'intro',
          title: 'The framework — six tools, six jobs, six kill conditions',
        }),
      },
      {
        vo:
          'A 10b5-1 plan: legal, disciplined selling. Choose it when new vests and exercises need to convert to cash on autopilot. Kill condition: you think it shelters tax or trades on what you know.',
        pauseAfter: 450,
        scene: P('decisionTable', 'fw-table', { mode: 'row-1', title: 'The framework — six tools, six jobs, six kill conditions' }),
      },
      {
        vo:
          'An exchange fund: instant diversification, maximum deferral. Choose it when the gain is big, liquidity can wait seven-plus years, and conviction is low. Kill condition: you need the money inside seven years.',
        pauseAfter: 450,
        scene: P('decisionTable', 'fw-table', { mode: 'row-2', title: 'The framework — six tools, six jobs, six kill conditions' }),
      },
      {
        vo:
          'Direct indexing: year-round loss harvesting. Choose it in a high bracket with regular gains, when the fee gap is narrow. Kill condition: no gains to offset, an IRA, or a wide fee gap.',
        pauseAfter: 450,
        scene: P('decisionTable', 'fw-table', { mode: 'row-3', title: 'The framework — six tools, six jobs, six kill conditions' }),
      },
      {
        vo:
          'A protective collar: a floor for a defined window. Choose it for a convicted holder of a volatile stock whose employer allows hedging. Kill condition: you are bullish, you need diversification, or hedging is banned.',
        pauseAfter: 450,
        scene: P('decisionTable', 'fw-table', { mode: 'row-4', title: 'The framework — six tools, six jobs, six kill conditions' }),
      },
      {
        vo:
          'A CRT or donor-advised fund: make the gain vanish and fund your giving. Choose it with genuine philanthropic intent and capital you will not need. Kill condition: you might need the principal back.',
        pauseAfter: 450,
        scene: P('decisionTable', 'fw-table', { mode: 'row-5', title: 'The framework — six tools, six jobs, six kill conditions' }),
      },
      {
        vo:
          'A levered long/short: fast, tax-deferred risk removal. Choose it at scale, with sophistication and leverage tolerance. Kill condition: you are fee- or leverage-averse.',
        pauseAfter: 600,
        scene: P('decisionTable', 'fw-table', { mode: 'row-6', title: 'The framework — six tools, six jobs, six kill conditions' }),
      },
      {
        vo:
          'And the real answer is almost never one row. It is a sequence. A ten-million-dollar position might put six million into an exchange fund for the core, run a 10b5-1 ladder for every new vest, drop a million into a donor-advised fund if you are charitably inclined, and retain a million with a collar — if your employer permits it — for the upside you cannot emotionally let go of.',
        pauseAfter: 450,
        scene: P('sequenceStack', 'fw-sequence', {
          title: 'The real answer is a sequence, not a row',
        }),
      },
      {
        vo:
          'The strategies are not competitors. They are layers.',
        pauseAfter: 600,
        voStyle: 'reveal',
        scene: P('sequenceStack', 'fw-sequence', {
          title: 'Not competitors. Layers.',
        }),
      },
      {
        vo:
          'But before any of it, answer one question honestly. If you had ten million dollars in cash today, would you buy this stock, at this price, in this concentration?',
        pauseAfter: 500,
        voStyle: 'reveal',
        dropOut: true,
        scene: P('host', 'fw-question', {
          headline: 'Would you buy this stock today,\nat this price,',
          gesture: 'shrug',
          kicker: 'in this concentration?',
        }),
      },
      {
        vo:
          'If the answer is no, then the tax is not a reason to hold. It is an excuse. And the tax is the price of the exit, not a reason to stay in the building.',
        pauseAfter: 700,
        scene: P('bigText', 'fw-excuse', {
          lines: ['The tax is not a reason to hold.', 'It is an excuse.'],
        }),
      },
      {
        vo:
          'Now I want to hear from you, because this is where the comment section earns its keep. Here is the question I actually want argued: Ballmer beat Gates by doing nothing. Was that skill — or survivorship bias dressed up as conviction?',
        pauseAfter: 500,
        scene: P('commentPrompt', 'fw-comment', {
          question: 'Ballmer beat Gates by doing nothing.',
          sub: 'Skill — or survivorship bias dressed up as conviction? Which of the six exits fits your balance sheet?',
        }),
      },
      {
        vo:
          'Tell me which side you are on, and tell me which of the six exits fits your balance sheet. I read every comment, and the sharpest argument gets pinned.',
        pauseAfter: 500,
        scene: P('commentPrompt', 'fw-comment', {
          question: 'Which of the six exits',
          sub: 'fits your balance sheet? The sharpest argument gets pinned.',
        }),
      },
      {
        vo:
          'If this saved you a billable hour with a five-hundred-dollar-an-hour advisor, the like button is the cheapest invoice you will ever pay. And if you know someone who has told you \u201cI will diversify after one more vest\u201d — send them this video. It is the cheapest intervention you will ever make.',
        pauseAfter: 500,
        scene: P('host', 'fw-like', {
          headline: 'The cheapest invoice\nyou will ever pay —',
          gesture: 'wave',
          kicker: 'and the cheapest intervention you will ever make',
        }),
      },
      {
        vo: 'Save the framework. You will need it before the next tranche.',
        pauseAfter: 500,
        scene: P('decisionTable', 'fw-table', { mode: 'full', title: 'Save the framework — you will need it before the next tranche' }),
      },
      {
        vo:
          'If you want the next deep dive done like this — the structures, the math, both sides, every number sourced — subscribe. That is the whole pitch.',
        pauseAfter: 600,
        scene: P('endScreen', 'fw-end', {}),
      },
      {
        vo:
          'This is education, not personalized tax or legal advice. The structures are U.S.-centric; if you are in the U.K., Canada, or Australia, the analogues exist but the rules differ — talk to a cross-border specialist before you act.',
        pauseAfter: 450,
        voStyle: 'calm',
        scene: P('srcCite', 'fw-disclaimer', {
          source: 'Education, not advice',
          detail: 'U.S.-centric structures — cross-border rules differ; talk to your own counsel',
        }),
      },
      {
        vo:
          'Every source is in the description. Talk to your own counsel, model your own numbers, and remember: the goal was never to pay zero tax. The goal was to stop letting the tax decide your future.',
        pauseAfter: 900,
        voStyle: 'reveal',
        scene: P('bigText', 'fw-close', {
          lines: ['The goal was never', 'to pay zero tax.'],
          lines2: ['It was to stop letting the tax', 'decide your future.'],
        }),
      },
    ],
  },
];

// ── Upload kit — the packaging block from the script's PACKAGING section ────

// ── U13-U16 (review report Phase 2 — CONTACT: scene policy, not new math) ───
// A pure data pass over the beat table that wires the report's four policy
// items into machinery that already exists — no new math:
//   U13 — every host beat whose narration NAMES a number carries
//     numberNamed: true; drawHost solves the near hand ON the kicker chip
//     (the contact target is a CHIP or CARD, never raw type) and points.
//   U14 — one held prop per chapter, written as beat assignments: ch1 host
//     beats hold the exhibit card (verb 'card' → the ledger-gated holdCard
//     prop the B2 rule already renders); the exits chapters' host beats
//     press the SIX EXITS tile edge (exitsContact); the collar chapter's
//     quote-card hosts keep the palm-on-the-rule contact — the kContact
//     verb on the desk the quote is set on (the payoff chart itself is
//     figureless, so the floor press rides the chapter's host beats).
//   U16 — the per-beat pose table: host beats without an explicit
//     gesture/entrance rotate the body-pose vocabulary (lean / countN /
//     crossed / step-in / sit / walk — every one already a POSES key or
//     the walk entrance) with consecutive repeats CAPPED AT TWO.
const U16_CYCLE = ['lean', 'countN', 'crossed', 'stepIn', 'sit', 'walk'] as const;
{
  let last = '';
  let run = 0;
  let cyc = 0;
  for (const ch of SCRIPT) {
    const exits = /^exit[1-6]$/.test(ch.id);
    for (const b of ch.beats) {
      if (b.scene.type !== 'host') continue;
      // U13: the narration names a number → the hand parks ON the chip.
      // Digits AND the spelled-out numbers the VO actually speaks
      // ("three-point-seven million", "eighty-five-dollar strike",
      // "two-thirds", "basis points") — the report's rule is about the
      // VOICE, not the orthography.
      if (/[$\d]|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|dozen|couple|half|quarter|percent|percentage|basis points?)\b/i.test(b.vo)) {
        b.scene.numberNamed = true;
        if (!b.scene.gesture && !b.scene.entrance && !b.scene.verb) {
          b.scene.gesture = 'pointR';
        }
      }
      // U14: the chapter's held-prop / contact assignments
      if (ch.id === 'ch1' && !b.scene.verb) b.scene.verb = 'card';
      if (exits && !b.scene.verb && !b.scene.entrance) b.scene.exitsContact = true;
      // U16: the pose column, repeats capped at two
      if (!b.scene.gesture && !b.scene.entrance && !b.scene.verb) {
        let pose = U16_CYCLE[cyc++ % U16_CYCLE.length];
        if (pose === last && run >= 2) {
          cyc++;
          pose = U16_CYCLE[cyc % U16_CYCLE.length];
        }
        run = pose === last ? run + 1 : 1;
        last = pose;
        switch (pose) {
          case 'lean': b.scene.gesture = 'leanIn'; break;
          case 'countN': b.scene.gesture = `count${(cyc % 3) + 1}`; break;
          case 'crossed': b.scene.gesture = 'crossed'; break;
          case 'stepIn': b.scene.entrance = 'walk'; b.scene.walkMs = 1400; break;
          case 'sit': b.scene.gesture = 'sitBack'; break;
          case 'walk': b.scene.entrance = 'walk'; break;
        }
      } else {
        const p = (b.scene.entrance as string) ?? (b.scene.gesture as string) ?? '';
        run = p === last ? run + 1 : 1;
        last = p;
      }
    }
  }
}

// U33 (review report U33 — THE 10-12 MINUTE FIRST UPLOAD): retention-per-
// minute beats total length for a new channel. The first-upload edit keeps
// the film's complete arc in ~11.4 minutes — the cold-open hook, the trap's
// math (ch1), the collar (the signature exit) and the decision framework —
// while the full 38-minute cut stays in SCRIPT for later. The render
// harness defaults to THIS cut (tools/frame-dump swaps SCRIPT to it; the
// gates still certify the full cut).
export const FIRST_UPLOAD_CUT: ChapterSpec[] = SCRIPT.filter((ch) =>
  ['cold-open', 'ch1', 'exit4', 'framework'].includes(ch.id));

export const VIDEO_TITLE = 'How the Rich Sell $10M of Stock Without Paying $3.7M in Taxes';

export const TITLE_OPTIONS = [
  'How the Rich Sell $10M of Stock Without Paying $3.7M in Taxes',
  'Your Company Stock Is a Trap. Here Are the 6 Exits.',
  'Exchange Funds, Collars & 10b5-1: The Concentrated-Stock Playbook',
  'Why Steve Ballmer Is Richer Than Bill Gates (And What It Costs You)',
];

export const NEXT_VIDEO_DEFAULT = 'The Zero-Cost Collar, Explained in 12 Minutes';

export const DESCRIPTION_BODY = [
  'Two-thirds of stocks underperform the index they belong to. About 40% lose 70% or more and never recover.',
  'If most of your net worth is one employer\u2019s stock, you are not an investor — you are a position.',
  'Here are the six ways professionals exit it, what each one actually costs, and the 2026 tax changes nobody is pricing in.',
  '',
  'Every claim is sourced. Where a number is a backtest or a provider\u2019s own marketing, the video says so.',
].join('\n');

export const KEY_SOURCES_LINE = [
  '• Bloomberg Billionaires Index, July 1, 2024',
  '• J.P. Morgan, \u201cThe Agony and the Ecstasy,\u201d 2014 + 2024 update',
  '• Bessembinder, \u201cDo Stocks Outperform Treasury Bills?\u201d, JFE 2018',
  '• SEC Release 33-11138 (10b5-1 amendments, Dec 2022); U.S. v. Peizer, C.D. Cal.',
  '• IRC \u00a7721 / \u00a7704(c) / \u00a7737 (exchange funds); Cache Q3 2025 results (provider-reported)',
  '• Cerulli Associates Apr 2025; FTSE Russell 2026; Elm Wealth 2024/2026; Frec Oct 2026',
  '• IRC \u00a71259 / \u00a71092 (collars); PortfoliosLab; Global X XCLR',
  '• IRC \u00a7664 / \u00a7170 / \u00a77520 (CRT/DAF); Valur model (illustrative); OBBBA 2025',
  '• \u201cLoss harvesting strategies tax efficiently diversify concentrated stock,\u201d J. Asset Management 26:447\u2013463, 2025',
].join('\n');

export const DESCRIPTION_TAIL = [
  '',
  'This is education, not personalized tax or legal advice. The structures are U.S.-centric; cross-border rules differ — talk to your own counsel and model your own numbers.',
].join('\n');

export const TAGS = [
  'concentrated stock', 'exchange fund', '10b5-1', 'direct indexing', 'tax loss harvesting',
  'collar options', 'charitable remainder trust', 'donor advised fund', 'levered long short',
  'capital gains tax', 'NIIT', 'QSBS 1202', 'de-risking', 'executive compensation', 'family office',
];

export const PINNED_COMMENT = [
  'The question I want argued: Ballmer passed Gates by holding >90% Microsoft. Skill, or survivorship bias? \uD83D\uDC47',
  'And tell me which of the 6 exits fits your balance sheet — sharpest argument gets pinned.',
  'Full source list (SEC filings, the BlackRock/JAM backtest, court records, provider disclosures) is in the description.',
  'One number that circulates in summaries of the BlackRock backtest is wrong — the correction, with the published table, is in Exit 6.',
].join('\n');
