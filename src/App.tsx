import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldX,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  CalendarDays,
  Clock,
  HandCoins,
  ChevronLeft,
  AlertTriangle,
  Info,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const FEARS = [
  { id: 0, text: 'I might lose the money I put in' },
  { id: 1, text: "I don't know enough to start" },
  { id: 2, text: "I can't lock away money for years" },
  { id: 3, text: "I don't know who to trust yet" },
];

type FundId = 0 | 1 | 2;

const FUNDS: {
  id: FundId;
  name: string;
  tag: string;
  tagColor: string;
  badge?: string;
  plain: string;
  stats: { label: string; value: string }[];
  rates: { bad: number; flat: number; good: number };
}[] = [
  {
    id: 0,
    name: 'Nifty 50 Index Fund',
    tag: 'Lower risk',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badge: 'Beginner Choice',
    plain: "Tracks India's top 50 companies. Grows alongside the national economy.",
    stats: [
      { label: 'Avg. Return', value: '+13.2%/yr' },
      { label: 'Worst Drop', value: '−28%' },
      { label: 'Min. Start', value: '₹100/mo' },
    ],
    rates: { bad: -0.28, flat: 0.07, good: 0.2 },
  },
  {
    id: 1,
    name: 'ELSS Tax-Saving Fund',
    tag: 'Medium risk',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-100',
    plain: 'Builds long-term wealth while saving tax. Has a 3-year lock-in.',
    stats: [
      { label: 'Avg. Return', value: '+15.1%/yr' },
      { label: 'Worst Drop', value: '−35%' },
      { label: 'Lock-in', value: '3 Years' },
    ],
    rates: { bad: -0.35, flat: 0.09, good: 0.23 },
  },
  {
    id: 2,
    name: 'Liquid Savings Fund',
    tag: 'Lowest risk',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-100',
    plain: 'Earns more than standard savings accounts with instant withdrawals.',
    stats: [
      { label: 'Avg. Return', value: '+6.5%/yr' },
      { label: 'Worst Drop', value: '~0%' },
      { label: 'Withdrawal', value: 'Anytime' },
    ],
    rates: { bad: -0.01, flat: 0.06, good: 0.08 },
  },
];

type Scenario = 'bad' | 'flat' | 'good';

const SCENARIO_META: Record<
  Scenario,
  { label: string; icon: typeof TrendingDown; color: string; bg: string; border: string }
> = {
  bad: {
    label: 'Slow Market Year',
    icon: TrendingDown,
    color: 'text-red-700',
    bg: 'bg-red-50/60',
    border: 'border-red-100',
  },
  flat: {
    label: 'Normal Steady Year',
    icon: Minus,
    color: 'text-amber-700',
    bg: 'bg-amber-50/60',
    border: 'border-amber-100',
  },
  good: {
    label: 'Great Market Year',
    icon: TrendingUp,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-100',
  },
};

const fmt = (n: number) =>
  Math.round(n).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  });

const fmtShort = (n: number) =>
  Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function computeScenarioValue(amount: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12;
  let total = 0;
  for (let i = 0; i < months; i++) {
    const monthsRemaining = months - i;
    total += amount * Math.pow(1 + monthlyRate, monthsRemaining);
  }
  return total;
}

function buildChartData(
  amount: number,
  rates: { bad: number; flat: number; good: number },
) {
  const months = Array.from({ length: 13 }, (_, i) => i);
  return months.map((m) => {
    const invested = amount * m;
    if (m === 0) return { month: '0', invested: 0, bad: 0, flat: 0, good: 0 };
    const badMonthly = rates.bad / 12;
    const flatMonthly = rates.flat / 12;
    const goodMonthly = rates.good / 12;
    let badVal = 0;
    let flatVal = 0;
    let goodVal = 0;
    for (let i = 0; i < m; i++) {
      const monthsLeft = m - i;
      badVal += amount * Math.pow(1 + badMonthly, monthsLeft);
      flatVal += amount * Math.pow(1 + flatMonthly, monthsLeft);
      goodVal += amount * Math.pow(1 + goodMonthly, monthsLeft);
    }
    return {
      month: `${m}`,
      invested,
      bad: Math.round(badVal),
      flat: Math.round(flatVal),
      good: Math.round(goodVal),
    };
  });
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [selectedFear, setSelectedFear] = useState<number | null>(null);
  const [selectedFund, setSelectedFund] = useState<FundId>(0);
  const [customAmount, setCustomAmount] = useState<number>(500);
  const [amountInput, setAmountInput] = useState<string>('500');
  const [amountError, setAmountError] = useState<string>('');
  const [currentScenario, setCurrentScenario] = useState<Scenario>('good');

  const SCREEN_ORDER = [0, 0.5, 1, 2, 3, 4, 5];

  const amount = customAmount;
  const fund = FUNDS[selectedFund];

  const scenarioValue = useMemo(() => {
    const rate = fund.rates[currentScenario];
    return computeScenarioValue(amount, rate, 12);
  }, [amount, fund, currentScenario]);

  const invested = amount * 12;

  const chartData = useMemo(
    () => buildChartData(amount, fund.rates),
    [amount, fund],
  );

  const worstLoss = useMemo(() => {
    const badValue = computeScenarioValue(amount, fund.rates.bad, 12);
    return invested - badValue;
  }, [amount, fund, invested]);

  const scenarioExplanation: Record<Scenario, string> = {
    bad: `In a bad phase, your saved ₹${fmtShort(invested)} would pull back to around ${fmt(scenarioValue)}. Markets typically bounce back over time.`,
    flat: `In a quiet market cycle, your saved ₹${fmtShort(invested)} is expected to stay secure and values around ${fmt(scenarioValue)}.`,
    good: `When the market performs beautifully, your savings could scale up to ${fmt(scenarioValue)}. Returns fluctuate naturally.`,
  };

  const goBack = () => {
    const idx = SCREEN_ORDER.indexOf(currentScreen);
    if (idx > 0) setCurrentScreen(SCREEN_ORDER[idx - 1]);
  };
  const goNext = () => {
    const idx = SCREEN_ORDER.indexOf(currentScreen);
    if (idx < SCREEN_ORDER.length - 1) setCurrentScreen(SCREEN_ORDER[idx + 1]);
  };
  const resetAll = () => {
    setCurrentScreen(0);
    setSelectedFear(null);
    setSelectedFund(0);
    setCustomAmount(500);
    setAmountInput('500');
    setAmountError('');
    setCurrentScenario('good');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 antialiased font-sans">
      
      {/* LOCKED IPHONE 14 CANVAS FRAME */}
      <div className="relative w-[390px] h-[734px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-200 overflow-hidden flex flex-col shrink-0 select-none">
        
        {/* Top Stepper Navigation */}
        {currentScreen >= 1 && currentScreen <= 4 && (
          <div className="pt-10 px-6 pb-2 border-b border-slate-100 bg-white shrink-0 z-40">
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={goBack}
                className="flex items-center gap-0.5 text-emerald-800 text-xs font-bold hover:opacity-75 transition-opacity"
              >
                <ChevronLeft size={16} strokeWidth={2.5} /> Back
              </button>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Step {Math.floor(currentScreen)} of 4
              </span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-700 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${(Math.floor(currentScreen) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Outer Content Sandbox */}
        <div className="flex-1 min-h-0 w-full relative bg-white">
          {currentScreen === 0 && <LandingScreen onContinue={goNext} />}
          {currentScreen === 0.5 && <PromiseScreen onContinue={goNext} />}
          {currentScreen === 1 && (
            <FearScreen selected={selectedFear} onSelect={setSelectedFear} onContinue={goNext} />
          )}
          {currentScreen === 2 && (
            <FundPickerScreen selected={selectedFund} onSelect={(id) => setSelectedFund(id)} onContinue={goNext} />
          )}
          {currentScreen === 3 && (
            <RiskScreen 
              fund={fund} amount={amount} amountInput={amountInput}
              amountError={amountError} onAmountInput={(val: string) => {
                setAmountInput(val);
                const num = parseInt(val, 10);
                if (!val || isNaN(num)) {
                  setAmountError('Please enter an amount to calculate');
                  setCustomAmount(100);
                } else if (num < 100) {
                  setAmountError('You can start with as little as ₹100');
                  setCustomAmount(100);
                } else if (num > 150000) {
                  setAmountError('Simplified learning limit is capped at ₹1,50,000');
                  setCustomAmount(150000);
                } else {
                  setAmountError('');
                  setCustomAmount(num);
                }
              }}
              scenario={currentScenario} onScenarioChange={setCurrentScenario}
              scenarioValue={scenarioValue} invested={invested}
              explanation={scenarioExplanation[currentScenario]}
              chartData={chartData} onContinue={goNext} 
            />
          )}
          {currentScreen === 4 && (
            <CommitScreen fund={fund} amount={amount} worstLoss={worstLoss} onConfirm={goNext} onChangeFund={() => setCurrentScreen(2)} />
          )}
          {currentScreen === 5 && (
            <SuccessScreen onRestart={resetAll} amount={amount} fundName={fund.name} projectedValue={scenarioValue} />
          )}
        </div>

        {/* Base Structural Spacer */}
        <div className="h-4 bg-white shrink-0 w-full" />
      </div>
    </div>
  );
}

/* ==========================================
   SCREEN 0: WELCOME
========================================== */
function LandingScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-between pt-12">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-sm">
          F
        </div>
        <span className="font-bold text-lg text-slate-800 tracking-tight">FirstStep</span>
      </div>

      <div className="my-auto py-4">
        <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          Smart Wealth Sandbox
        </p>
        <h1 className="text-[32px] font-extrabold text-slate-950 leading-tight mb-4 tracking-tight">
          Your savings can <br />
          grow automatically <br />
          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block mt-1">while you sleep.</span>
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Learn how to grow your wealth with just ₹100. No complex formulas, no jargon. Just a safe space to practice.
        </p>
      </div>

      <div>
        <button
          onClick={onContinue}
          className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs"
        >
          Try the Simulator
          <ArrowRight size={16} />
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Educational Practice • No Real Money Needed
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   SCREEN 0.5: TRANSPARENCY PROMISE
========================================== */
function PromiseScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-between pt-10">
      <div className="overflow-y-auto pr-0.5 space-y-4 scrollbar-none">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Our Honest Guidelines</h2>
          <p className="text-slate-500 text-xs leading-normal">
            We designed this preview to make the stock market simple and safe to practice.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">What we do</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100">
              {[
                'Let you test investment plans starting at just ₹100',
                'Show you realistic risks and bad years transparently',
                'Give you complete control to pause or reset variables',
                'Explain terms in warm, simple everyday words'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-700 leading-tight font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldX size={16} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">What we never do</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100">
              {[
                'Make false promises about guaranteed high returns',
                'Bury important rules inside hidden fine print contracts',
                'Pressure you into risky day trading habits'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-500 leading-tight font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
      >
        Let's Practice
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ==========================================
   SCREEN 1: FEAR QUESTION
========================================== */
function FearScreen({ selected, onSelect, onContinue }: { selected: number | null; onSelect: (id: number) => void; onContinue: () => void }) {
  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">What worries you most about saving?</h2>
        <p className="text-slate-400 text-xs mb-5">Your answer helps us customize what information to spotlight for you.</p>

        <div className="space-y-3">
          {FEARS.map((fear) => {
            const isSelected = selected === fear.id;
            return (
              <button
                key={fear.id}
                onClick={() => onSelect(fear.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all flex items-center gap-3 ${
                  isSelected ? 'border-emerald-700 bg-emerald-50/40 ring-1 ring-emerald-700' : 'border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-700 bg-emerald-700' : 'border-slate-300'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-950' : 'text-slate-600'}`}>{fear.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        Continue
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ==========================================
   SCREEN 2: CONDENSED CURATED FUND SELECTOR
========================================== */
function FundPickerScreen({ selected, onSelect, onContinue }: { selected: FundId; onSelect: (id: FundId) => void; onContinue: () => void }) {
  return (
    <div className="absolute inset-0 p-5 flex flex-col justify-between">
      <div className="space-y-2.5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Choose an option to explore</h2>
          <p className="text-slate-400 text-xs">Clear blueprints built for absolute beginners.</p>
        </div>

        <div className="space-y-2">
          {FUNDS.map((fund) => {
            const isSelected = selected === fund.id;
            return (
              <button
                key={fund.id}
                onClick={() => onSelect(fund.id)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all flex flex-col ${
                  isSelected ? 'border-emerald-700 bg-emerald-50/25 ring-1 ring-emerald-700' : 'border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-slate-900">{fund.name}</span>
                  {fund.badge && (
                    <span className="text-[8px] font-bold bg-emerald-800 text-white px-1.5 py-0.5 rounded tracking-tight uppercase">
                      {fund.badge}
                    </span>
                  )}
                </div>
                
                <div className="mt-1 mb-2">
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${fund.tagColor}`}>
                    {fund.tag}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-slate-50/80 rounded-lg py-1 border border-slate-100 w-full mb-1.5">
                  {fund.stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-[11px] font-bold text-slate-950">{s.value}</p>
                      <p className="text-[8px] text-slate-400 font-medium uppercase tracking-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
                
                <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-100 pt-1 w-full">
                  {fund.plain}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
      >
        Pick & Preview Growth
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ==========================================
   SCREEN 3: RISK ENGINE & GRAPH
========================================== */
function RiskScreen({
  fund, amountInput, amountError, onAmountInput, scenario, onScenarioChange, scenarioValue, invested, explanation, chartData, onContinue
}: {
  fund: (typeof FUNDS)[0]; amount: number; amountInput: string; amountError: string; onAmountInput: (v: string) => void;
  scenario: Scenario; onScenarioChange: (s: Scenario) => void; scenarioValue: number; invested: number; explanation: string;
  chartData: ReturnType<typeof buildChartData>; onContinue: () => void;
}) {
  const meta = SCENARIO_META[scenario];
  const ScenarioIcon = meta.icon;
  const pnl = scenarioValue - invested;
  const isProfitable = pnl >= 0;

  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-between">
      <div className="overflow-y-auto pr-0.5 space-y-3.5 scrollbar-none max-h-[570px]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-0.5">See what happens to your savings</h2>
          <p className="text-slate-400 text-xs">Simulating: {fund.name}</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Choose your Monthly Savings Target
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => onAmountInput(e.target.value)}
              className={`w-full pl-7 pr-4 py-2 rounded-xl border-2 text-sm font-bold transition-all focus:outline-none ${
                amountError ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-emerald-700/20 focus:border-emerald-700 bg-emerald-50/5'
              }`}
            />
          </div>
          {amountError ? (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle size={12} /> {amountError}
            </p>
          ) : (
            <div className="flex gap-1.5 mt-1.5">
              {[100, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onAmountInput(String(preset))}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {(Object.keys(SCENARIO_META) as Scenario[]).map((key) => {
            const m = SCENARIO_META[key];
            return (
              <button
                key={key}
                onClick={() => onScenarioChange(key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  scenario === key ? `${m.bg} ${m.border} ${m.color} ring-1 ring-current` : 'bg-white border-slate-200 text-slate-400 hover:text-slate-50'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className={`rounded-xl border p-3 transition-colors ${meta.bg} ${meta.border}`}>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <ScenarioIcon size={15} className={meta.color} />
              <span className={`text-xs font-bold ${meta.color}`}>In 12 Months:</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isProfitable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {isProfitable ? 'Growth: +' : 'Drawdown: '}{fmt(pnl)}
            </span>
          </div>
          <p className={`text-xl font-black ${meta.color} mb-0.5`}>{fmt(scenarioValue)}</p>
          <p className="text-[10px] text-slate-400 font-bold mb-1.5">Total Amount Deposited: {fmt(invested)}</p>
          <p className="text-[11px] text-slate-600 leading-normal font-medium">{explanation}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-3xs">
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${fmtShort(v)}`} />
              <Tooltip
                formatter={(value: unknown) => value == null ? ['', ''] : [`₹${fmtShort(Number(value))}`, '']}
                contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #e2e8f0', padding: '4px 6px' }}
              />
              <Line type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="bad" stroke="#dc2626" strokeWidth={scenario === 'bad' ? 2.5 : 1} dot={false} />
              <Line type="monotone" dataKey="flat" stroke="#d97706" strokeWidth={scenario === 'flat' ? 2.5 : 1} dot={false} />
              <Line type="monotone" dataKey="good" stroke="#16a34a" strokeWidth={scenario === 'good' ? 2.5 : 1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-start gap-1.5 px-0.5">
          <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            Click on "Slow Market Year" to deliberately look at potential down-cycles. We believe in complete honesty.
          </p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
      >
        Continue to Setup
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ==========================================
   SCREEN 4: REVIEW SUMMARY
========================================== */
function CommitScreen({ fund, amount, worstLoss, onConfirm, onChangeFund }: { fund: (typeof FUNDS)[0]; amount: number; worstLoss: number; onConfirm: () => void; onChangeFund: () => void }) {
  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Review Your Savings Setup</h2>

        <div className="rounded-xl bg-emerald-800 p-4 mb-3.5 text-white shadow-xs">
          <p className="text-emerald-200 text-[10px] uppercase font-bold tracking-wider mb-0.5">Planned Monthly Deposit</p>
          <p className="text-2xl font-black mb-0.5">
            ₹{fmtShort(amount)}<span className="text-xs font-normal text-emerald-200"> / month</span>
          </p>
          <p className="text-emerald-100 text-xs font-medium pt-1.5 mt-1.5 border-t border-emerald-700/60">{fund.name}</p>
        </div>

        <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-slate-50">
          <DetailRow icon={<Info size={14} className="text-slate-400" />} label="Asset Allocation Category" value={fund.tag} />
          <DetailRow icon={<CalendarDays size={14} className="text-slate-400" />} label="Monthly Deposit Date" value="5th of every month" />
          <DetailRow icon={<HandCoins size={14} className="text-slate-400" />} label="Can I pause anytime?" value="Yes, instantly" />
          <DetailRow icon={<TrendingDown size={14} className="text-red-400" />} label="Worst-Case Historic Drop" value={`~${fmt(worstLoss)}`} valueClass="text-red-600 font-bold" />
        </div>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onConfirm}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-xs"
        >
          Activate Savings Plan
        </button>
        <button
          onClick={onChangeFund}
          className="w-full border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold py-2 rounded-xl transition-colors text-xs"
        >
          Change Amount or Choice
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, valueClass = 'text-slate-800' }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 bg-white">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ==========================================
   SCREEN 5: REDESIGNED FINTECH MILESTONE SUMMARY
========================================== */
function SuccessScreen({ 
  onRestart, amount, fundName, projectedValue 
}: { 
  onRestart: () => void; amount: number; fundName: string; projectedValue: number 
}) {
  const annualInvested = amount * 12;

  const growthPreviewData = [
    { name: 'Now', value: 0 },
    { name: '30d', value: amount * 1.01 },
    { name: '90d', value: amount * 3 * 1.03 },
    { name: '1 Year', value: projectedValue }
  ];

  return (
    <div className="absolute inset-0 p-5 flex flex-col justify-between pt-10 bg-slate-50/50">
      
      <div className="overflow-y-auto pr-0.5 space-y-4 scrollbar-none flex-1 max-h-[585px]">
        
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-3 group">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:rotate-12">
              <Sparkles size={26} className="text-white animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Your Wealth Journey is Live!
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Custom wealth blueprint active for Bharathees</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/40 rounded-bl-full pointer-events-none -z-0" />
          
          <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3.5 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Selected Asset</p>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{fundName}</h4>
            </div>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Plan Activated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 relative z-10">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Wallet size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-medium">Monthly Investment</span>
              </div>
              <p className="text-sm font-black text-slate-900">₹{fmtShort(amount)}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <CalendarDays size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-medium">Next Auto-Invest</span>
              </div>
              <p className="text-sm font-black text-slate-900">05th July</p>
            </div>

            <div className="col-span-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ArrowUpRight size={13} strokeWidth={2.5} className="text-emerald-600" />
                  <span className="text-[10px] font-medium">1-Year Compounding Base Goal</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded">25% Complete</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '25%' }} />
                </div>
                <span className="text-[10px] font-black text-slate-700 whitespace-nowrap">
                  ₹{fmtShort(amount * 3)} / ₹{fmtShort(annualInvested)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-3xs">
          <div className="flex justify-between items-center mb-2 px-1">
            <div>
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Expected 1-Year Compound Projection</h4>
              <p className="text-[10px] text-slate-400">Growth trajectory based on historical market trends</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-600">~{fmt(projectedValue)}</p>
            </div>
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-1 border border-slate-100">
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={growthPreviewData} margin={{ top: 8, right: 10, left: -25, bottom: -5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${fmtShort(v)}`} />
                <Tooltip
                  formatter={(value: unknown) => [`₹${fmtShort(Number(value))}`, 'Projected Portfolio']}
                  contentStyle={{ fontSize: 9, borderRadius: 6, border: '1px solid #e2e8f0', padding: '2px 4px' }}
                />
                <Line type="monotone" dataKey="value" stroke="url(#successGradient)" strokeWidth={2.5} dot={{ r: 2, fill: '#0d9488', strokeWidth: 0 }} activeDot={{ r: 4 }} />
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-3 text-white flex gap-3 shadow-xs items-center">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <HandCoins size={16} className="text-emerald-300" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-medium text-emerald-200 leading-normal">
              By automating <strong className="text-white font-bold">₹{fmtShort(amount)}</strong> on the 5th, you secure market averages before standard monthly expenses can dilute your savings power.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-2 shrink-0">
        <button
          onClick={() => alert("Simulation Completed! Real portfolio dashboard module goes live here.")}
          className="w-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:opacity-95 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
        >
          View My Plan Dashboard
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
        
        <button
          onClick={onRestart}
          className="w-full bg-white hover:bg-slate-50 text-slate-500 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs border border-slate-200"
        >
          <RefreshCw size={12} strokeWidth={2.5} />
          Reset & Simulate New Target
        </button>
      </div>
    </div>
  );
}