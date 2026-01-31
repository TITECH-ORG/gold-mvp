import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { CONFIG } from './config'
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, countryMeta, createTranslator, languageMeta } from './i18n'

const defaultState = {
  isLoggedIn: false,
  kycStatus: 'pending',
  cashBalance: 84250,
  metals: {
    gold: 2.154,
    silver: 120.4,
    platinum: 0.85,
  },
  walletAddresses: {
    gold: 'GOLD-G9H2-4K7Z',
    silver: 'GSIL-S4Q8-1M2N',
    platinum: 'GPLT-P7R3-9X1C',
  },
  seeded: true,
}

const IMAGE_SET = {
  gold: '/hero-image.webp',
  silver: '/silver.png',
  platinum: '/platinum.png',
}

const SLIDES = [
  { key: 'slide1Title', text: 'slide1Text', image: IMAGE_SET.gold },
  { key: 'slide2Title', text: 'slide2Text', image: IMAGE_SET.silver },
  { key: 'slide3Title', text: 'slide3Text', image: IMAGE_SET.platinum },
]

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

const useHashRoute = (defaultRoute) => {
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return hash || defaultRoute
  })

  useEffect(() => {
    const onChange = () => setRoute(window.location.hash.replace('#', '') || defaultRoute)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [defaultRoute])

  const navigate = (to) => {
    window.location.hash = to
  }

  return { route, navigate }
}

const usePriceTicker = ({ country }) => {
  const base = country === 'AE' ? 245 : 2250
  const [price, setPrice] = useState(base)
  const [trend, setTrend] = useState(0)

  useEffect(() => {
    setPrice(base)
  }, [country, base])

  useEffect(() => {
    let mounted = true
    const tick = async () => {
      if (!mounted) return
      if (CONFIG.priceFeed.endpoint) {
        try {
          const response = await fetch(CONFIG.priceFeed.endpoint)
          const data = await response.json()
          if (data?.price) {
            setPrice(data.price)
            setTrend(data.change || 0)
            return
          }
        } catch (_) {
          // fallback to demo
        }
      }
      const drift = (Math.random() - 0.48) * (country === 'AE' ? 0.6 : 5)
      setPrice((prev) => Math.max(0, prev + drift))
      setTrend(drift)
    }

    const id = setInterval(tick, 3000)
    tick()
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [country])

  return { price, trend, isDemo: !CONFIG.priceFeed.endpoint }
}

const formatMoney = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatNumber = (value, language, digits = 3) => {
  const locale = languageMeta[language]?.locale || languageMeta.en.locale
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
  }).format(value)
}

const Icon = ({ name }) => (
  <span className="material-symbols-rounded text-lg">{name}</span>
)

const PageHeader = ({ title, onBack, right }) => (
  <div className="mb-4 flex items-center justify-between">
    <button
      onClick={onBack}
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]"
    >
      <Icon name="chevron_left" />
    </button>
    <h2 className="text-base font-semibold">{title}</h2>
    <div className="flex h-10 w-10 items-center justify-center">{right}</div>
  </div>
)
const BottomNav = ({ route, navigate, labels, theme }) => {
  const items = [
    { key: 'home', label: labels.home, icon: 'home' },
    { key: 'wallet', label: labels.wallet, icon: 'account_balance_wallet' },
    { key: 'trade', label: labels.trade, icon: 'paid', center: true },
    { key: 'history', label: labels.history, icon: 'receipt_long' },
    { key: 'profile', label: labels.profile, icon: 'person' },
  ]

  const isLight = theme === 'light'
  return (
    <nav
      className={`fixed bottom-3 left-1/2 z-50 w-[min(96vw,420px)] -translate-x-1/2 rounded-3xl border p-2 backdrop-blur ${
        isLight ? 'border-slate-200 bg-white/90' : 'border-[hsl(var(--border))] bg-black/70'
      }`}
    >
      <div className="grid grid-cols-5 items-end gap-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`flex flex-col items-center gap-1 text-xs ${
              route === item.key ? 'text-[hsl(var(--primary))]' : isLight ? 'text-slate-500' : 'text-[hsl(var(--muted-foreground))]'
            } ${item.center ? '-translate-y-4' : ''}`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                item.center
                  ? 'bg-gradient-to-br from-[#b8842e] to-[#f2c166] text-black shadow-lg shadow-amber-500/40'
                  : isLight
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]'
              }`}
            >
              <Icon name={item.icon} />
            </div>
            <span className={item.center ? 'text-[hsl(var(--primary))]' : ''}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

function App() {
  const [language, setLanguage] = useLocalStorage('goldex.language', 'en')
  const [country, setCountry] = useLocalStorage('goldex.country', 'TR')
  const [session, setSession] = useLocalStorage('goldex.session', defaultState)
  const [onboarded, setOnboarded] = useLocalStorage('goldex.onboarded', false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [theme, setTheme] = useLocalStorage('goldex.theme', 'dark')
  const [pendingCountry, setPendingCountry] = useState(null)
  const [showCountryConfirm, setShowCountryConfirm] = useState(false)
  const [notifications] = useState([
    { id: 'N-1001', title: 'Price alert triggered', body: 'Gold hit your target price.', time: '2m' },
    { id: 'N-1002', title: 'Deposit received', body: 'TRY 5,000 added to wallet.', time: '1h' },
    { id: 'N-1003', title: 'Verification pending', body: 'KYC review in progress.', time: '1d' },
  ])
  const [authStep, setAuthStep] = useState('intro')
  const [legalRead, setLegalRead] = useState(false)
  const [legalMode, setLegalMode] = useState('flow')
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [tradeMode, setTradeMode] = useState('buy')
  const [amountCash, setAmountCash] = useState('')
  const [amountMetal, setAmountMetal] = useState('')
  const [tradeError, setTradeError] = useState(false)
  const [tradeStep, setTradeStep] = useState('idle')
  const [tradeMessage, setTradeMessage] = useState('')
  const [withdrawStep, setWithdrawStep] = useState('idle')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawError, setWithdrawError] = useState(false)
  const [alerts, setAlerts] = useState([
    { id: 'AL-1001', metal: 'gold', target: 2420, status: 'pending' },
    { id: 'AL-1002', metal: 'silver', target: 28.5, status: 'completed' },
  ])
  const [newAlertMetal, setNewAlertMetal] = useState('gold')
  const [newAlertTarget, setNewAlertTarget] = useState('')
  const [showTradeReview, setShowTradeReview] = useState(false)
  const [metal, setMetal] = useLocalStorage('goldex.metal', 'gold')
  const [depositMethod, setDepositMethod] = useState(null)
  const { route, navigate } = useHashRoute(onboarded ? 'home' : 'onboarding')

  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : 'en'
  const safeCountry = SUPPORTED_COUNTRIES.includes(country) ? country : 'TR'
  const t = useMemo(() => createTranslator(safeLanguage), [safeLanguage])
  const meta = countryMeta[safeCountry]
  const { price, trend } = usePriceTicker({ country: safeCountry })

  useEffect(() => {
    const { dir, locale } = languageMeta[safeLanguage] || languageMeta.en
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [safeLanguage])

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light')
  }, [theme])

  useEffect(() => {
    if (authStep !== 'intro') return
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(id)
  }, [authStep])

  const applyCountryChange = (nextCountry) => {
    setCountry(nextCountry)
    setSession((prev) => ({ ...prev, kycStatus: 'pending' }))
    setShowCountryConfirm(false)
  }

  const unitOptions = safeCountry === 'AE' ? ['g', 'tola'] : ['g']
  const [unit, setUnit] = useLocalStorage('goldex.unit', unitOptions[0])
  const priceLabel = unit === 'tola' ? t('tola') : t('grams')

  const metalLabel = metal === 'silver' ? t('silver') : metal === 'platinum' ? t('platinum') : t('gold')
  const metalMultiplier = metal === 'silver' ? 0.0125 : metal === 'platinum' ? 0.65 : 1
  const unitPrice = price * metalMultiplier
  const metalCards = [
    { key: 'gold', label: t('gold'), multiplier: 1, image: IMAGE_SET.gold },
    { key: 'silver', label: t('silver'), multiplier: 0.0125, image: IMAGE_SET.silver },
    { key: 'platinum', label: t('platinum'), multiplier: 0.65, image: IMAGE_SET.platinum },
  ]
  const feeRate = 0.005
  const normalizedSession = useMemo(() => {
    if (!session || !session.metals) {
      return { ...defaultState, ...session, metals: session?.metals || defaultState.metals, seeded: true }
    }
    return session
  }, [session])

  useEffect(() => {
    if (!session?.seeded) {
      setSession({ ...defaultState, ...session, metals: session?.metals || defaultState.metals, seeded: true })
    }
  }, [session, setSession])

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount)
    if (!amount || amount <= 0 || amount > normalizedSession.cashBalance) {
      setWithdrawError(true)
      return
    }
    setWithdrawError(false)
    setWithdrawStep('processing')
    setTimeout(() => {
      setSession((prev) => ({ ...prev, cashBalance: Math.max(0, (prev.cashBalance || 0) - amount) }))
      setWithdrawStep('success')
      setWithdrawAmount('')
    }, 900)
  }

  const updateFromCash = (value) => {
    const numeric = Number(value)
    setAmountCash(value)
    setTradeError(false)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setAmountMetal('')
      return
    }
    const metalQty = numeric / unitPrice
    setAmountMetal(metalQty ? metalQty.toFixed(3) : '')
  }

  const updateFromMetal = (value) => {
    const numeric = Number(value)
    setAmountMetal(value)
    setTradeError(false)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setAmountCash('')
      return
    }
    const cashValue = numeric * unitPrice
    setAmountCash(cashValue ? cashValue.toFixed(2) : '')
  }

  const handleTradeReview = () => {
    const cash = Number(amountCash)
    const metalQty = Number(amountMetal)
    if (!cash || !metalQty) {
      setTradeError(true)
      return
    }
    if (tradeMode === 'buy' && cash > normalizedSession.cashBalance) {
      setTradeError(true)
      setTradeMessage(t('insufficientBalance'))
      return
    }
    if (tradeMode === 'sell' && metalQty > (normalizedSession.metals?.[metal] || 0)) {
      setTradeError(true)
      setTradeMessage(t('insufficientMetal'))
      return
    }
    setTradeMessage('')
    setShowTradeReview(true)
    setTradeStep('review')
  }

  const confirmTrade = () => {
    setTradeStep('processing')
    const cash = Number(amountCash) || 0
    const metalQty = Number(amountMetal) || 0
    const fee = cash * feeRate
    const total = cash + fee

    setTimeout(() => {
      setSession((prev) => {
        const next = prev?.metals ? { ...prev } : { ...defaultState, ...prev, metals: prev?.metals || defaultState.metals }
        if (tradeMode === 'buy') {
          next.cashBalance = Math.max(0, (next.cashBalance || 0) - total)
          next.metals[metal] = (next.metals[metal] || 0) + metalQty
        } else {
          next.cashBalance = (next.cashBalance || 0) + (cash - fee)
          next.metals[metal] = Math.max(0, (next.metals[metal] || 0) - metalQty)
        }
        return next
      })
      setTradeStep('success')
      setTradeMessage(t('tradeSuccess'))
    }, 900)
  }

  const quickActions = [
    { key: 'buy', label: t('buy'), icon: 'shopping_cart', route: 'trade' },
    { key: 'sell', label: t('sell'), icon: 'sell', route: 'trade' },
    { key: 'transfer', label: t('transferShort'), icon: 'swap_horiz', route: 'transfer' },
    { key: 'delivery', label: t('deliveryShort'), icon: 'local_shipping', route: 'delivery' },
  ]

  const services = [
    { key: 'transfer', title: t('transferGold'), desc: t('transferToUser'), route: 'transfer', icon: 'swap_horiz' },
    { key: 'delivery', title: t('physicalDelivery'), desc: t('deliveryRequest'), route: 'delivery', icon: 'inventory_2' },
    { key: 'alerts', title: t('priceAlerts'), desc: t('newAlert'), route: 'alerts', icon: 'notifications' },
    { key: 'support', title: t('support'), desc: t('contactSupport'), route: 'support', icon: 'support_agent' },
    { key: 'legal', title: t('legal'), desc: t('terms'), route: 'legal', icon: 'gavel' },
  ]

  const renderOnboarding = () => (
    <div className="min-h-screen px-6 pb-24 pt-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-gradient-to-br from-[#b8842e] to-[#f2c166] px-4 py-2 text-sm font-semibold text-black">Goldex</div>
          <Button variant="ghost" size="sm" onClick={() => setActiveSlide((prev) => (prev + 1) % SLIDES.length)}>
            {t('skip')}
          </Button>
        </div>
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
        >
          <div className="mb-4 flex gap-2">
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 flex-1 rounded-full ${idx === activeSlide ? 'bg-[hsl(var(--primary))]' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <img src={SLIDES[activeSlide].image} alt="Gold" className="h-48 w-48 object-contain" />
            <h2 className="text-2xl font-semibold">{t(SLIDES[activeSlide].key)}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t(SLIDES[activeSlide].text)}</p>
          </div>
        </motion.div>
        <Button size="lg" onClick={() => { setOnboarded(true); navigate('home') }}>
          {t('onboardingStart')}
        </Button>
      </div>
    </div>
  )

  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-6 pb-28 pt-6"
    >
      <PageHeader
        title={t('home')}
        onBack={() => navigate('home')}
        right={
          <button onClick={() => navigate('notifications')} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))]">
            <Icon name="notifications" />
          </button>
        }
      />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.2em]">{t('livePrice')}</CardDescription>
            <CardTitle className="text-3xl">
              {formatMoney(unitPrice, languageMeta[safeLanguage].locale, meta.currency)}
            </CardTitle>
            <div className={`text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend >= 0 ? '+' : ''}{formatNumber(trend, safeLanguage, 2)}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {metalLabel} · {t('pricePerUnit')} · {priceLabel}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <img
              src={metal === 'silver' ? IMAGE_SET.silver : metal === 'platinum' ? IMAGE_SET.platinum : IMAGE_SET.gold}
              alt={metalLabel}
              className="mx-auto h-36 w-36 object-contain"
            />
            <div className="grid grid-cols-3 gap-2">
              {metalCards.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setMetal(item.key)}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                    metal === item.key
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('goldBalance')}</p>
                <p className="text-lg font-semibold">
                  {formatNumber(normalizedSession.metals?.[metal] || 0, safeLanguage)} {priceLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('cashBalance')}</p>
                <p className="text-lg font-semibold">
                  {formatMoney(normalizedSession.cashBalance, languageMeta[safeLanguage].locale, meta.currency)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {metalCards.map((item) => (
                <div
                  key={item.key}
                  className="min-w-0 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-3"
                >
                  <img src={item.image} alt={item.label} className="mb-2 h-10 w-10 object-contain" />
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  <p className="mt-1 truncate text-[13px] font-semibold tabular-nums">
                    {formatMoney(price * item.multiplier, languageMeta[safeLanguage].locale, meta.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => { setTradeMode('buy'); navigate('trade') }}>{t('buy')}</Button>
              <Button variant="secondary" onClick={() => { setTradeMode('sell'); navigate('trade') }}>{t('sell')}</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('quickActions')}</h3>
        <button
          className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]"
          onClick={() => navigate('services')}
        >
          {t('services')}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((item) => (
          <motion.button
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (item.key === 'buy') setTradeMode('buy')
              if (item.key === 'sell') setTradeMode('sell')
              navigate(item.route)
            }}
            className="flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                <Icon name={item.icon} />
              </div>
              <span className="max-w-[140px] truncate whitespace-nowrap">{item.label}</span>
            </div>
            <span className="text-[hsl(var(--primary))]">›</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )

  const renderTrade = () => (
    <motion.div
      key="trade"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-6 pb-28 pt-6"
    >
      <PageHeader title={t('trade')} onBack={() => navigate('home')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('trade')}</CardTitle>
          <CardDescription>{t('pricePerUnit')} · {priceLabel}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Tabs value={tradeMode} onValueChange={setTradeMode}>
            <TabsList className="w-full">
              <TabsTrigger value="buy" className="w-full">{t('buy')}</TabsTrigger>
              <TabsTrigger value="sell" className="w-full">{t('sell')}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('goldUnit')}</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder={t('goldUnit')} />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === 'tola' ? t('tola') : t('grams')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('metalType')}</label>
              <Select value={metal} onValueChange={setMetal}>
                <SelectTrigger>
                  <SelectValue placeholder={t('metalType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">{t('gold')}</SelectItem>
                  <SelectItem value="silver">{t('silver')}</SelectItem>
                  <SelectItem value="platinum">{t('platinum')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{meta.currencyLabel}</label>
            <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${tradeError ? 'border-red-400/60 bg-red-500/10 animate-shake' : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'}`}>
              <input
                type="number"
                className="w-full bg-transparent text-lg outline-none"
                placeholder="0"
                value={amountCash}
                onChange={(event) => updateFromCash(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{priceLabel}</label>
            <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${tradeError ? 'border-red-400/60 bg-red-500/10 animate-shake' : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'}`}>
              <input
                type="number"
                className="w-full bg-transparent text-lg outline-none"
                placeholder="0"
                value={amountMetal}
                onChange={(event) => updateFromMetal(event.target.value)}
              />
            </div>
          </div>
          {tradeError && (
            <div className="text-xs text-red-400">{tradeMessage || t('required')}</div>
          )}

          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
              <span>{t('fee')}</span>
              <span>{formatMoney((Number(amountCash) || 0) * feeRate, languageMeta[safeLanguage].locale, meta.currency)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>{t('total')}</span>
              <span>
                {formatMoney(
                  (Number(amountCash) || 0) + (Number(amountCash) || 0) * feeRate,
                  languageMeta[safeLanguage].locale,
                  meta.currency
                )}
              </span>
            </div>
          </div>

          <Button size="lg" onClick={handleTradeReview}>
            {tradeMode === 'buy' ? t('buyGold') : t('sellGold')}
          </Button>
        </CardContent>
      </Card>
      {showTradeReview && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-6 pb-24 pt-6">
          <div className="w-full max-w-[420px] rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('trade')}</h3>
              <button onClick={() => { setShowTradeReview(false); setTradeStep('idle') }} className="text-[hsl(var(--muted-foreground))]">×</button>
            </div>
            {tradeStep === 'review' && (
              <>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t('metalType')}</span>
                    <span className="font-semibold">{metalLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('amount')}</span>
                    <span className="font-semibold">{amountMetal || '0'} {priceLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('total')}</span>
                    <span className="font-semibold">
                      {formatMoney(
                        (Number(amountCash) || 0) + (Number(amountCash) || 0) * feeRate,
                        languageMeta[safeLanguage].locale,
                        meta.currency
                      )}
                    </span>
                  </div>
                </div>
                <Button className="mt-5 w-full" onClick={confirmTrade}>
                  {t('confirm')}
                </Button>
              </>
            )}
            {tradeStep === 'processing' && (
              <div className="grid gap-3 text-center text-sm">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
                <p className="text-[hsl(var(--muted-foreground))]">{t('processingWallet')}</p>
              </div>
            )}
            {tradeStep === 'success' && (
              <div className="grid gap-3 text-center text-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]">
                  <Icon name="check" />
                </div>
                <p className="font-semibold">{tradeMessage || t('tradeSuccess')}</p>
                <Button className="mt-2 w-full" onClick={() => { setShowTradeReview(false); setTradeStep('idle') }}>
                  {t('done')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )

  const renderServices = () => (
    <motion.div
      key="services"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-6 pb-28 pt-6"
    >
      <PageHeader title={t('services')} onBack={() => navigate('home')} />
      <div className="grid gap-4">
        {services.map((item) => (
          <motion.button
            key={item.key}
            onClick={() => navigate(item.route)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-5 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                <Icon name={item.icon} />
              </div>
              <div>
                <p className="text-base font-semibold">{item.title}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
              </div>
            </div>
            <span className="text-[hsl(var(--primary))]">›</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )

  const renderWallet = () => (
    <motion.div
      key="wallet"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-6 pb-28 pt-6"
    >
      <PageHeader title={t('wallet')} onBack={() => navigate('home')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('wallet')}</CardTitle>
          <CardDescription>{t('cashBalance')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-4">
            <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <span>{t('cashBalance')}</span>
              <span>{meta.currency}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {formatMoney(normalizedSession.cashBalance, languageMeta[safeLanguage].locale, meta.currency)}
            </p>
          </div>
          <div className="grid gap-3">
            {metalCards.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.label} className="h-10 w-10 object-contain" />
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('goldBalance')} · {priceLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold">
                    {formatNumber(normalizedSession.metals?.[item.key] || 0, safeLanguage)} {priceLabel}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatMoney(
                      price * item.multiplier * (normalizedSession.metals?.[item.key] || 0),
                      languageMeta[safeLanguage].locale,
                      meta.currency
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={() => navigate('deposit')}>{t('deposit')}</Button>
            <Button variant="secondary" onClick={() => navigate('withdraw')}>{t('withdraw')}</Button>
            <Button variant="secondary" onClick={() => navigate('transfer')}>{t('transferGold')}</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderTransfer = () => (
    <div className="px-6 pb-28 pt-6">
      <PageHeader title={t('transferGold')} onBack={() => navigate('services')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('transferGold')}</CardTitle>
          <CardDescription>{t('transferToUser')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('recipient')}</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <input type="text" className="w-full bg-transparent text-lg outline-none" placeholder="@goldex.user" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('metalType')}</label>
            <Select value={metal} onValueChange={setMetal}>
              <SelectTrigger>
                <SelectValue placeholder={t('metalType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">{t('gold')}</SelectItem>
                <SelectItem value="silver">{t('silver')}</SelectItem>
                <SelectItem value="platinum">{t('platinum')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('amount')}</label>
            <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${withdrawError ? 'border-red-400/60 bg-red-500/10 animate-shake' : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'}`}>
              <input
                type="number"
                className="w-full bg-transparent text-lg outline-none"
                placeholder="0"
                value={withdrawAmount}
                onChange={(event) => { setWithdrawAmount(event.target.value); setWithdrawError(false) }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('note')}</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <input type="text" className="w-full bg-transparent text-lg outline-none" placeholder={t('notePlaceholder')} />
            </div>
          </div>
          <Button size="lg">{t('transferGold')}</Button>
        </CardContent>
      </Card>
    </div>
  )

  const goToLegal = (mode = 'flow') => {
    setLegalRead(false)
    setLegalMode(mode)
    setAuthStep('legal')
  }

  const renderAuth = () => (
    <motion.div key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="px-6 pb-16 pt-6">
      <PageHeader title={t('authTitle')} onBack={() => navigate('home')} />
      {authStep === 'intro' && (
        <div className="grid gap-6 text-center">
          <div className="text-3xl font-semibold">Goldex</div>
          <motion.div
            key={`intro-${activeSlide}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="grid gap-3"
          >
            <div className="text-2xl font-semibold">{t(SLIDES[activeSlide].key)}</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t(SLIDES[activeSlide].text)}</p>
          </motion.div>
          <motion.img
            key={`intro-img-${activeSlide}`}
            src={SLIDES[activeSlide].image}
            alt="Intro"
            className="mx-auto h-44 w-44 object-contain"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <div className="flex justify-center gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 w-2 rounded-full ${idx === activeSlide ? 'bg-[hsl(var(--primary))]' : 'bg-white/10'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="grid gap-3">
            <Button size="lg" onClick={() => setAuthStep('login')}>{t('signIn')}</Button>
            <Button size="lg" variant="secondary" onClick={() => setAuthStep('signup')}>{t('signUp')}</Button>
          </div>
          <button className="text-xs text-[hsl(var(--muted-foreground))] underline" onClick={() => goToLegal('pre')}>
            {t('legal')}
          </button>
        </div>
      )}

      {authStep === 'login' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('signIn')}</CardTitle>
            <CardDescription>{t('phoneNumber')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PhoneInput
              country={safeCountry === 'TR' ? 'tr' : 'ae'}
              value=""
              inputClass="form-control"
              containerClass="w-full"
            />
            <Button size="lg" onClick={() => setAuthStep('otp')}>{t('sendCode')}</Button>
          </CardContent>
        </Card>
      )}

      {authStep === 'signup' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('signUp')}</CardTitle>
            <CardDescription>{t('phoneNumber')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PhoneInput
              country={safeCountry === 'TR' ? 'tr' : 'ae'}
              value=""
              inputClass="form-control"
              containerClass="w-full"
            />
            <Button size="lg" onClick={() => setAuthStep('otp')}>{t('continue')}</Button>
          </CardContent>
        </Card>
      )}

      {authStep === 'otp' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('enterCode')}</CardTitle>
            <CardDescription>{t('phoneNumber')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <input
                type="text"
                className="w-full bg-transparent text-lg outline-none"
                placeholder="1234"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
              />
            </div>
            <Button size="lg" onClick={() => setAuthStep('password')}>{t('continue')}</Button>
          </CardContent>
        </Card>
      )}

      {authStep === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('setPassword')}</CardTitle>
            <CardDescription>{t('passwordRules')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <input
                type="password"
                className="w-full bg-transparent text-lg outline-none"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button size="lg" onClick={() => goToLegal('flow')}>{t('continue')}</Button>
          </CardContent>
        </Card>
      )}

      {authStep === 'legal' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('legalTitle')}</CardTitle>
            <CardDescription>{t('readAndAccept')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div
              className="max-h-[240px] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-xs text-[hsl(var(--muted-foreground))]"
              onScroll={(event) => {
                const el = event.currentTarget
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 6) setLegalRead(true)
              }}
            >
              <p>{t('agreeTerms')}</p>
              <p className="mt-3">{t('agreePrivacy')}</p>
              <p className="mt-3">{t('agreeRisk')}</p>
              <p className="mt-3">{t('agreeAml')}</p>
              <p className="mt-3">{t('agreeComms')}</p>
            </div>
            {legalMode === 'flow' ? (
              <>
                <label className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                    checked={legalRead}
                    onChange={(event) => setLegalRead(event.target.checked)}
                  />
                  {t('readAndAccept')}
                </label>
                <Button size="lg" disabled={!legalRead} onClick={() => { setSession({ ...normalizedSession, isLoggedIn: true }); navigate('home') }}>
                  {t('confirm')}
                </Button>
              </>
            ) : (
              <Button size="lg" variant="secondary" onClick={() => setAuthStep('intro')}>
                {t('back')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  )

  const renderSignup = () => (
    <motion.div key="signup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="px-6 pb-28 pt-6">
      <PageHeader title={t('signupTitle')} onBack={() => navigate('auth')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('signupTitle')}</CardTitle>
          <CardDescription>{t('legalTitle')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('phoneNumber')}</label>
            <PhoneInput
              country={safeCountry === 'TR' ? 'tr' : 'ae'}
              value=""
              inputClass="form-control"
              containerClass="w-full"
            />
          </div>
          <Button size="lg" onClick={() => navigate('legal')}>{t('continue')}</Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderLegal = () => {
    const [readDone, setReadDone] = useState(false)
    return (
      <div className="px-6 pb-28 pt-6">
        <PageHeader title={t('legal')} onBack={() => navigate('signup')} />
        <Card>
          <CardHeader>
            <CardTitle>{t('legalTitle')}</CardTitle>
            <CardDescription>{safeCountry === 'TR' ? 'Turkey' : 'UAE'}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div
              className="max-h-[220px] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-xs text-[hsl(var(--muted-foreground))]"
              onScroll={(event) => {
                const el = event.currentTarget
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setReadDone(true)
              }}
            >
              <p>{safeCountry === 'TR' ? t('agreeTerms') : t('agreeTerms')}</p>
              <p className="mt-3">{safeCountry === 'TR' ? t('agreePrivacy') : t('agreePrivacy')}</p>
              <p className="mt-3">{safeCountry === 'TR' ? t('agreeRisk') : t('agreeRisk')}</p>
              <p className="mt-3">{safeCountry === 'TR' ? t('agreeAml') : t('agreeAml')}</p>
              <p className="mt-3">{safeCountry === 'TR' ? t('agreeComms') : t('agreeComms')}</p>
            </div>
            <Button size="lg" disabled={!readDone} onClick={() => { setSession({ ...normalizedSession, isLoggedIn: true }); navigate('home') }}>
              {t('readAndAccept')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDeposit = () => (
    <motion.div
      key="deposit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-6 pb-28 pt-6"
    >
      <PageHeader title={t('deposit')} onBack={() => navigate('wallet')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('deposit')}</CardTitle>
          <CardDescription>{t('availableMethods')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-4">
            <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <span>{t('cashBalance')}</span>
              <span>{meta.currency}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {formatMoney(normalizedSession.cashBalance, languageMeta[safeLanguage].locale, meta.currency)}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('metalType')}</label>
              <Select value={metal} onValueChange={setMetal}>
                <SelectTrigger>
                  <SelectValue placeholder={t('metalType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">{t('gold')}</SelectItem>
                  <SelectItem value="silver">{t('silver')}</SelectItem>
                  <SelectItem value="platinum">{t('platinum')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-4">
              <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                <span>GoldexID</span>
                <button
                  className="text-[hsl(var(--primary))]"
                  onClick={() => navigator.clipboard?.writeText(normalizedSession.walletAddresses?.[metal] || '')}
                >
                  {t('copy')}
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold">{normalizedSession.walletAddresses?.[metal]}</p>
            </div>
          </div>
          <div className="grid gap-3">
            {(safeCountry === 'TR'
              ? [t('fastTransfer'), t('kolasEasyAddress'), t('ibanTransfer')]
              : [t('aaniInstant'), t('uaeBankTransfer'), t('cardPayment')]
            ).map((label) => (
              <button
                key={label}
                onClick={() => setDepositMethod(label)}
                className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-4 text-left"
              >
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-[hsl(var(--primary))]">›</span>
              </button>
            ))}
          </div>
          {depositMethod && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-4 text-sm">
              <div className="flex items-center justify-between">
                <span>{t('status')}</span>
                <span className="text-[hsl(var(--primary))]">{depositMethod}</span>
              </div>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                {t('locationRequired')}
              </p>
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('amount')}</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <input type="number" className="w-full bg-transparent text-lg outline-none" placeholder="0" />
            </div>
          </div>
          <Button size="lg">{t('confirm')}</Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderWithdraw = () => (
    <motion.div
      key="withdraw"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-6 pb-28 pt-6"
    >
      <PageHeader title={t('withdraw')} onBack={() => navigate('wallet')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('withdraw')}</CardTitle>
          <CardDescription>{t('bankAccounts')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-4">
            <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <span>{t('cashBalance')}</span>
              <span>{meta.currency}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {formatMoney(normalizedSession.cashBalance, languageMeta[safeLanguage].locale, meta.currency)}
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('amount')}</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <input type="number" className="w-full bg-transparent text-lg outline-none" placeholder="0" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('bankAccounts')}</label>
            <Select defaultValue="iban">
              <SelectTrigger>
                <SelectValue placeholder={t('bankAccounts')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iban">{t('ibanMask')}</SelectItem>
                <SelectItem value="add">{t('addBank')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {withdrawError && (
            <div className="text-xs text-red-400">{t('insufficientBalance')}</div>
          )}
          <Button size="lg" onClick={handleWithdraw}>{t('withdraw')}</Button>
        </CardContent>
      </Card>
      {withdrawStep !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-6 pb-24 pt-6">
          <div className="w-full max-w-[420px] rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center">
            {withdrawStep === 'processing' && (
              <div className="grid gap-3 text-sm">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
                <p className="text-[hsl(var(--muted-foreground))]">{t('processingWithdraw')}</p>
              </div>
            )}
            {withdrawStep === 'success' && (
              <div className="grid gap-3 text-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]">
                  <Icon name="check" />
                </div>
                <p className="font-semibold">{t('withdrawalSuccess')}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {meta.currency} {formatNumber(Number(withdrawAmount) || 0, safeLanguage)}
                </p>
                <Button className="mt-2 w-full" onClick={() => setWithdrawStep('idle')}>{t('done')}</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )

  const renderProfile = () => {
    const paymentMethods = safeCountry === 'TR'
      ? [t('fastTransfer'), t('kolasEasyAddress'), t('ibanTransfer')]
      : [t('aaniInstant'), t('uaeBankTransfer'), t('cardPayment')]

    return (
      <motion.div
        key="profile"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-6 pb-28 pt-6"
      >
        <PageHeader title={t('profile')} onBack={() => navigate('home')} />
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('profileDetails')}</CardTitle>
            <CardDescription>{safeCountry === 'TR' ? t('turkey') : t('uae')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('countryAndLanguage')}</p>
              <p className="text-sm font-semibold">{safeCountry === 'TR' ? t('turkey') : t('uae')} · {languageMeta[safeLanguage].label}</p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('walletAddress')}</p>
              <p className="text-sm font-semibold">{normalizedSession.walletAddresses?.gold}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('settings')}</CardTitle>
            <CardDescription>{t('notifications')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <span className="text-sm">{t('chooseCountry')}</span>
              <Select
                value={safeCountry}
                onValueChange={(value) => {
                  setPendingCountry(value)
                  setShowCountryConfirm(true)
                }}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder={t('chooseCountry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TR">{t('turkey')}</SelectItem>
                  <SelectItem value="AE">{t('uae')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <span className="text-sm">{t('chooseLanguage')}</span>
              <Select value={safeLanguage} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder={t('chooseLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
              <span className="text-sm">Theme</span>
              <div className="flex gap-2">
                <Button size="sm" variant={theme === 'dark' ? 'default' : 'secondary'} onClick={() => setTheme('dark')}>Dark</Button>
                <Button size="sm" variant={theme === 'light' ? 'default' : 'secondary'} onClick={() => setTheme('light')}>Light</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('availableMethods')}</CardTitle>
            <CardDescription>{t('deposit')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {paymentMethods.map((method) => (
              <div key={method} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3 text-sm">
                <span>{method}</span>
                <Icon name="chevron_right" />
              </div>
            ))}
          </CardContent>
        </Card>
        {showCountryConfirm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-6 pb-24 pt-6">
            <div className="w-full max-w-[420px] rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('countryQuestion')}
              </p>
              <p className="mt-2 text-base font-semibold">{pendingCountry === 'AE' ? t('uae') : t('turkey')}</p>
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                {t('kycRequired')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={() => setShowCountryConfirm(false)}>{t('cancel')}</Button>
                <Button onClick={() => applyCountryChange(pendingCountry)}>{t('confirm')}</Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  const renderHistory = () => {
    const historyItems = [
      { id: 'TRX-1001', type: t('buy'), metal: t('gold'), amount: '1.250', currency: meta.currency, value: 5820, status: t('completed') },
      { id: 'TRX-1002', type: t('sell'), metal: t('silver'), amount: '24.000', currency: meta.currency, value: 920, status: t('completed') },
      { id: 'TRX-1003', type: t('transferGold'), metal: t('platinum'), amount: '0.120', currency: meta.currency, value: 3100, status: t('pending') },
      { id: 'TRX-1004', type: t('deposit'), metal: t('cashBalance'), amount: '—', currency: meta.currency, value: 2500, status: t('completed') },
      { id: 'TRX-1005', type: t('withdraw'), metal: t('cashBalance'), amount: '—', currency: meta.currency, value: 800, status: t('failed') },
    ]

    return (
      <motion.div
        key="history"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-6 pb-28 pt-6"
      >
        <PageHeader title={t('historyTitle')} onBack={() => navigate('home')} />
        <div className="grid gap-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{item.type}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.id}</p>
                </div>
                <span className="text-xs text-[hsl(var(--primary))]">{item.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{item.metal}</span>
                <span className="font-semibold whitespace-nowrap">
                  {item.amount} {item.amount !== '—' ? priceLabel : ''} · {formatMoney(item.value, languageMeta[safeLanguage].locale, meta.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const renderAlerts = () => {
    return (
      <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="px-6 pb-28 pt-6">
        <PageHeader title={t('alertsTitle')} onBack={() => navigate('home')} />
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('newAlert')}</CardTitle>
            <CardDescription>{t('alertHint')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('metalType')}</label>
              <Select value={newAlertMetal} onValueChange={setNewAlertMetal}>
                <SelectTrigger>
                  <SelectValue placeholder={t('metalType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">{t('gold')}</SelectItem>
                  <SelectItem value="silver">{t('silver')}</SelectItem>
                  <SelectItem value="platinum">{t('platinum')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('alertPrice')}</label>
              <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3">
                <input
                  type="number"
                  className="w-full bg-transparent text-lg outline-none"
                  placeholder="0"
                  value={newAlertTarget}
                  onChange={(event) => setNewAlertTarget(event.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                const target = Number(newAlertTarget)
                if (!target) return
                const id = `AL-${Math.floor(Math.random() * 9000 + 1000)}`
                setAlerts((prev) => [{ id, metal: newAlertMetal, target, status: 'pending' }, ...prev])
                setNewAlertTarget('')
              }}
            >
              {t('alertCreate')}
            </Button>
          </CardContent>
        </Card>
        <div className="grid gap-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{alert.metal === 'gold' ? t('gold') : alert.metal === 'silver' ? t('silver') : t('platinum')}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{alert.id}</p>
                </div>
                <span className="text-xs text-[hsl(var(--primary))]">{alert.status === 'completed' ? t('completed') : t('pending')}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{t('alertPrice')}</span>
                <span className="font-semibold">{formatMoney(alert.target, languageMeta[safeLanguage].locale, meta.currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const renderNotifications = () => (
    <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="px-6 pb-28 pt-6">
      <PageHeader title={t('notificationsTitle')} onBack={() => navigate('home')} />
      <div className="grid gap-3">
        {notifications.map((note) => (
          <div key={note.id} className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{note.title}</p>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{note.time}</span>
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{note.body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )

  const renderPlaceholder = (title, description) => (
    <div className="px-6 pb-28 pt-6">
      <PageHeader title={title} onBack={() => navigate('home')} />
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-4 text-sm text-[hsl(var(--muted-foreground))]">
            <Icon name="info" />
            {t('locationRequired')}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const screen = () => {
    if (!onboarded) return renderOnboarding()

    switch (route) {
      case 'home':
        return renderHome()
      case 'trade':
        return renderTrade()
      case 'services':
        return renderServices()
      case 'auth':
        return renderAuth()
      case 'signup':
        return renderSignup()
      case 'legal':
        return renderLegal()
      case 'alerts':
        return renderAlerts()
      case 'notifications':
        return renderNotifications()
      case 'transfer':
        return renderTransfer()
      case 'deposit':
        return renderDeposit()
      case 'withdraw':
        return renderWithdraw()
      case 'wallet':
        return renderWallet()
      case 'history':
        return renderHistory()
      case 'profile':
        return renderProfile()
      default:
        return renderHome()
    }
  }

  const hideNavRoutes = ['auth', 'signup', 'legal', 'onboarding']
  return (
    <div className="min-h-screen">
      {screen()}
      {onboarded && !hideNavRoutes.includes(route) && (
        <BottomNav
          route={route}
          navigate={navigate}
          labels={{ home: t('home'), trade: t('trade'), wallet: t('wallet'), history: t('history'), profile: t('profile') }}
          theme={theme}
        />
      )}
    </div>
  )
}

export default App
