import React, { useEffect, useMemo, useReducer, useState } from 'react'

// ---------- design tokens ----------
const T = {
  bg: '#0a0a0a', panel: '#111', border: '#1f1f1f', borderHi: '#2a2a2a',
  text: '#e6e6e6', dim: '#8a8a8a', accent: '#9effa1',
  warn: '#ffcf66', bad: '#ff6b6b', ok: '#6ee7a8', info: '#7cc7ff'
}

const STATUS_FLOW = ['idle', 'warming', 'armed', 'live', 'cooldown', 'done']
const STATUS_COLOR = {
  idle: T.dim, warming: T.warn, armed: T.info,
  live: T.accent, cooldown: T.warn, done: T.ok, failed: T.bad
}
const PRIORITY_COLOR = { p0: T.bad, p1: T.warn, p2: T.info, p3: T.dim }

// ---------- primitives ----------
const Panel = ({ title, right, children, style }) => (
  <section style={{ border: `1px solid ${T.border}`, background: T.panel, borderRadius: 4, marginBottom: 12, ...style }}>
    {title && (
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.border}`, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.dim }}>
        <span>{title}</span><span>{right}</span>
      </header>
    )}
    <div style={{ padding: 12 }}>{children}</div>
  </section>
)

const Pill = ({ color = T.dim, children, onClick }) => (
  <span onClick={onClick} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 2, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', border: `1px solid ${color}40`, color, background: `${color}12`, cursor: onClick ? 'pointer' : 'default', userSelect: 'none' }}>{children}</span>
)

const KPI = ({ label, value, unit, tone = T.text }) => (
  <div style={{ flex: 1, minWidth: 120 }}>
    <div style={{ fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 22, color: tone, fontWeight: 600 }}>
      {value}<span style={{ fontSize: 11, color: T.dim, marginLeft: 4 }}>{unit}</span>
    </div>
  </div>
)

const Btn = ({ children, primary, danger, ...rest }) => (
  <button {...rest} style={{ background: primary ? T.accent : 'transparent', color: primary ? '#021006' : (danger ? T.bad : T.text), border: `1px solid ${primary ? T.accent : (danger ? T.bad : T.borderHi)}`, padding: '6px 12px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>{children}</button>
)

const Field = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 10 }}>
    <div style={{ fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    {children}
  </label>
)

const inputStyle = { width: '100%', background: '#0a0a0a', color: T.text, border: `1px solid ${T.border}`, padding: '6px 8px', fontFamily: 'inherit', fontSize: 12, borderRadius: 2 }

// ---------- primitives ----------
const Panel = ({ title, right, children, style }) => (
  <section style={{ border: `1px solid ${T.border}`, background: T.panel, borderRadius: 4, marginBottom: 12, ...style }}>
    {title && (
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.border}`, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.dim }}>
        <span>{title}</span><span>{right}</span>
      </header>
    )}
    <div style={{ padding: 12 }}>{children}</div>
  </section>
)

const Pill = ({ color = T.dim, children, onClick }) => (
  <span onClick={onClick} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 2, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', border: `1px solid ${color}40`, color, background: `${color}12`, cursor: onClick ? 'pointer' : 'default', userSelect: 'none' }}>{children}</span>
)

const KPI = ({ label, value, unit, tone = T.text }) => (
  <div style={{ flex: 1, minWidth: 120 }}>
    <div style={{ fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 22, color: tone, fontWeight: 600 }}>{value}<span style={{ fontSize: 11, color: T.dim, marginLeft: 4 }}>{unit}</span></div>
  </div>
)

const Btn = ({ children, primary, danger, ...rest }) => (
  <button {...rest} style={{ background: primary ? T.accent : 'transparent', color: primary ? '#021006' : (danger ? T.bad : T.text), border: `1px solid ${primary ? T.accent : (danger ? T.bad : T.borderHi)}`, padding: '6px 12px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>{children}</button>
)

const Field = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 10 }}>
    <div style={{ fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    {children}
  </label>
)

const inputStyle = { width: '100%', background: '#0a0a0a', color: T.text, border: `1px solid ${T.border}`, padding: '6px 8px', fontFamily: 'inherit', fontSize: 12, borderRadius: 2 }

// ---------- state ----------
const INITIAL = {
  drops: [
    { id: 'drp_001', name: 'SNKRS / Dunk Low Panda', site: 'nike.com', priority: 'p0', status: 'armed', sessions: 24, profiles: 12, success: 0, fail: 0, startsAt: '2026-04-22T21:00:00Z' },
    { id: 'drp_002', name: 'Supreme Week 9', site: 'supremenewyork.com', priority: 'p1', status: 'warming', sessions: 8, profiles: 8, success: 0, fail: 1, startsAt: '2026-04-24T16:00:00Z' },
    { id: 'drp_003', name: 'Shopify / Retro AJ1', site: 'shopify-partner.com', priority: 'p2', status: 'idle', sessions: 0, profiles: 0, success: 0, fail: 0, startsAt: '2026-04-26T14:00:00Z' }
  ],
  stack: { proxyPool: 'residential-tier1', captchaProvider: 'capsolver', monitor: 'sole-retriever', concurrency: 24, retries: 3 }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add_drop': return { ...state, drops: [action.drop, ...state.drops] }
    case 'advance_status': {
      const drops = state.drops.map(d => {
        if (d.id !== action.id) return d
        const i = STATUS_FLOW.indexOf(d.status)
        const next = i < 0 || i === STATUS_FLOW.length - 1 ? d.status : STATUS_FLOW[i + 1]
        return { ...d, status: next }
      })
      return { ...state, drops }
    }
    case 'fail_drop': return { ...state, drops: state.drops.map(d => d.id === action.id ? { ...d, status: 'failed' } : d) }
    case 'remove_drop': return { ...state, drops: state.drops.filter(d => d.id !== action.id) }
    case 'update_stack': return { ...state, stack: { ...state.stack, ...action.patch } }
    default: return state
  }
}

const fmtTime = iso => { try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch { return iso } }
const nowUTC = () => new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z'

// ---------- main component ----------
export default function DropControlPanel() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const [tab, setTab] = useState('drops')
  const [clock, setClock] = useState(nowUTC())
  const [metrics, setMetrics] = useState({ cpu: 12, mem: 38, rps: 140, errors: 0 })
  const [events, setEvents] = useState([
    { t: nowUTC(), lvl: 'info', msg: 'console boot ok' },
    { t: nowUTC(), lvl: 'info', msg: 'stack: residential-tier1 / capsolver' }
  ])

  useEffect(() => {
    const id = setInterval(() => {
      setClock(nowUTC())
      setMetrics(m => ({
        cpu: clamp(m.cpu + rand(-3, 3), 2, 95),
        mem: clamp(m.mem + rand(-2, 2), 10, 92),
        rps: clamp(m.rps + rand(-15, 15), 0, 600),
        errors: clamp(m.errors + (Math.random() < 0.1 ? 1 : 0), 0, 999)
      }))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const totals = useMemo(() => state.drops.reduce((a, d) => ({
    sessions: a.sessions + d.sessions,
    profiles: a.profiles + d.profiles,
    live: a.live + (d.status === 'live' ? 1 : 0),
    failed: a.failed + (d.status === 'failed' ? 1 : 0)
  }), { sessions: 0, profiles: 0, live: 0, failed: 0 }), [state.drops])

  const logEvent = (lvl, msg) => setEvents(ev => [{ t: nowUTC(), lvl, msg }, ...ev].slice(0, 50))

  const handleAdvance = id => { dispatch({ type: 'advance_status', id }); logEvent('info', `drop ${id} advanced`) }
  const handleFail = id => { dispatch({ type: 'fail_drop', id }); logEvent('error', `drop ${id} marked failed`) }
  const handleRemove = id => { if (confirm(`remove ${id}?`)) { dispatch({ type: 'remove_drop', id }); logEvent('warn', `drop ${id} removed`) } }

  const addDrop = draft => {
    const id = 'drp_' + String(Math.floor(Math.random() * 9000) + 1000)
    const drop = { id, sessions: 0, profiles: 0, success: 0, fail: 0, status: 'idle', ...draft }
    dispatch({ type: 'add_drop', drop })
    logEvent('info', `drop ${id} created (${drop.site})`)
  }

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
      <TopBar clock={clock} totals={totals} />
      <MetricsStrip metrics={metrics} />
      <Tabs tab={tab} onChange={setTab} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 16 }}>
        {tab === 'drops' && <DropsView drops={state.drops} onAdvance={handleAdvance} onFail={handleFail} onRemove={handleRemove} onAdd={addDrop} />}
        {tab === 'stack' && <StackView stack={state.stack} onUpdate={patch => { dispatch({ type: 'update_stack', patch }); logEvent('info', 'stack updated') }} />}
        {tab === 'telemetry' && <TelemetryView metrics={metrics} events={events} />}
      </main>
      <footer style={{ textAlign: 'center', padding: 24, color: T.dim, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>drop.console — operator build — rev 0.1</footer>
    </div>
  )
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)) }
function rand(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo }

// ---------- subcomponents ----------
function TopBar({ clock, totals }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${T.border}`, background: '#060606' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>DROP.CONSOLE</div>
        <Pill color={T.accent}>systems nominal</Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: T.dim }}>
        <span>live: <span style={{ color: T.accent }}>{totals.live}</span></span>
        <span>failed: <span style={{ color: T.bad }}>{totals.failed}</span></span>
        <span>sessions: <span style={{ color: T.text }}>{totals.sessions}</span></span>
        <span style={{ color: T.info }}>{clock}</span>
      </div>
    </div>
  )
}

function MetricsStrip({ metrics }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16, borderBottom: `1px solid ${T.border}`, background: '#080808' }}>
      <KPI label="CPU" value={metrics.cpu} unit="%" tone={metrics.cpu > 80 ? T.bad : T.text} />
      <KPI label="MEM" value={metrics.mem} unit="%" tone={metrics.mem > 80 ? T.warn : T.text} />
      <KPI label="RPS" value={metrics.rps} unit="/s" tone={T.info} />
      <KPI label="ERRORS" value={metrics.errors} unit="total" tone={metrics.errors > 0 ? T.warn : T.dim} />
    </div>
  )
}

function Tabs({ tab, onChange }) {
  const tabs = [['drops', 'drops'], ['stack', 'stack'], ['telemetry', 'telemetry']]
  return (
    <nav style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: '#080808', padding: '0 16px' }}>
      {tabs.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)} style={{
          background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === k ? T.accent : 'transparent'}`,
          color: tab === k ? T.accent : T.dim, padding: '12px 18px', fontSize: 11, letterSpacing: 2,
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit'
        }}>{label}</button>
      ))}
    </nav>
  )
}

function DropsView({ drops, onAdvance, onFail, onRemove, onAdd }) {
  const [draft, setDraft] = useState({ name: '', site: '', priority: 'p2', startsAt: '' })
  const valid = draft.name.trim() && draft.site.trim()
  return (
    <>
      <Panel title="add drop">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 10, alignItems: 'end' }}>
          <Field label="name"><input style={inputStyle} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Yeezy restock" /></Field>
          <Field label="site"><input style={inputStyle} value={draft.site} onChange={e => setDraft({ ...draft, site: e.target.value })} placeholder="domain.com" /></Field>
          <Field label="priority">
            <select style={inputStyle} value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })}>
              <option value="p0">p0 — critical</option>
              <option value="p1">p1 — high</option>
              <option value="p2">p2 — normal</option>
              <option value="p3">p3 — low</option>
            </select>
          </Field>
          <Field label="starts at (ISO)"><input style={inputStyle} value={draft.startsAt} onChange={e => setDraft({ ...draft, startsAt: e.target.value })} placeholder="2026-04-30T14:00:00Z" /></Field>
          <Btn primary disabled={!valid} onClick={() => { if (!valid) return; onAdd(draft); setDraft({ name: '', site: '', priority: 'p2', startsAt: '' }) }}>arm</Btn>
        </div>
      </Panel>

      <Panel title={`drops (${drops.length})`} right={<Pill color={T.dim}>click status to advance</Pill>}>
        {drops.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: T.dim, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>no drops armed — create one above</div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 110px 110px 110px 90px', gap: 8, fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 8px' }}>
              <span>pri</span><span>drop</span><span>site</span><span>status</span><span>sessions</span><span>starts</span><span>ops</span>
            </div>
            {drops.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 110px 110px 110px 90px', gap: 8, alignItems: 'center', padding: '8px', border: `1px solid ${T.border}`, borderRadius: 2, fontSize: 12 }}>
                <Pill color={PRIORITY_COLOR[d.priority]}>{d.priority}</Pill>
                <div>
                  <div style={{ color: T.text }}>{d.name}</div>
                  <div style={{ color: T.dim, fontSize: 10 }}>{d.id}</div>
                </div>
                <span style={{ color: T.dim }}>{d.site}</span>
                <Pill color={STATUS_COLOR[d.status] || T.dim} onClick={() => onAdvance(d.id)}>{d.status}</Pill>
                <span style={{ color: T.dim }}>{d.sessions} / {d.profiles}</span>
                <span style={{ color: T.dim, fontSize: 11 }}>{d.startsAt ? fmtTime(d.startsAt) : '—'}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Btn danger onClick={() => onFail(d.id)}>x</Btn>
                  <Btn onClick={() => onRemove(d.id)}>rm</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  )
}

function StackView({ stack, onUpdate }) {
  return (
    <Panel title="stack configuration" right={<Pill color={T.info}>live</Pill>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Field label="proxy pool">
          <select style={inputStyle} value={stack.proxyPool} onChange={e => onUpdate({ proxyPool: e.target.value })}>
            <option value="residential-tier1">residential-tier1</option>
            <option value="residential-tier2">residential-tier2</option>
            <option value="isp-static">isp-static</option>
            <option value="datacenter">datacenter</option>
          </select>
        </Field>
        <Field label="captcha provider">
          <select style={inputStyle} value={stack.captchaProvider} onChange={e => onUpdate({ captchaProvider: e.target.value })}>
            <option value="capsolver">capsolver</option>
            <option value="2captcha">2captcha</option>
            <option value="anti-captcha">anti-captcha</option>
            <option value="none">none</option>
          </select>
        </Field>
        <Field label="monitor">
          <select style={inputStyle} value={stack.monitor} onChange={e => onUpdate({ monitor: e.target.value })}>
            <option value="sole-retriever">sole-retriever</option>
            <option value="hydra">hydra</option>
            <option value="custom-webhook">custom-webhook</option>
          </select>
        </Field>
        <Field label="concurrency">
          <input style={inputStyle} type="number" min="1" max="256" value={stack.concurrency} onChange={e => onUpdate({ concurrency: Number(e.target.value) || 1 })} />
        </Field>
        <Field label="retries">
          <input style={inputStyle} type="number" min="0" max="10" value={stack.retries} onChange={e => onUpdate({ retries: Number(e.target.value) || 0 })} />
        </Field>
      </div>
    </Panel>
  )
}

function TelemetryView({ metrics, events }) {
  const lvlColor = { info: T.info, warn: T.warn, error: T.bad }
  return (
    <>
      <Panel title="live metrics">
        <div style={{ display: 'flex', gap: 12 }}>
          <KPI label="CPU" value={metrics.cpu} unit="%" tone={metrics.cpu > 80 ? T.bad : T.text} />
          <KPI label="MEM" value={metrics.mem} unit="%" tone={metrics.mem > 80 ? T.warn : T.text} />
          <KPI label="RPS" value={metrics.rps} unit="/s" tone={T.info} />
          <KPI label="ERR" value={metrics.errors} unit="total" tone={metrics.errors > 0 ? T.warn : T.dim} />
        </div>
      </Panel>
      <Panel title={`event stream (${events.length})`}>
        {events.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: T.dim, fontSize: 11 }}>no events yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 4, fontSize: 11 }}>
            {events.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 60px 1fr', gap: 8, padding: '4px 6px', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.dim }}>{e.t}</span>
                <Pill color={lvlColor[e.lvl] || T.dim}>{e.lvl}</Pill>
                <span>{e.msg}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  )
}
