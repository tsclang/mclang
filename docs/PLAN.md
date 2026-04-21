# План документации mclang (docs/ru)

## Формат каждой страницы

```markdown
# Название

Краткое описание одной строкой.

## Синтаксис

\```
синтаксис
\```

## Описание

Подробное объяснение.

## Примеры

\```
рабочий пример
\```

## Частые ошибки

### Ошибка: <название>
\```
код с ошибкой
\```
```
Error: <сообщение компилятора>
```

### Исправление
\```
правильный код
\```

## См. также

- [ссылки на связанные страницы]
```

---

## Структура каталога

```
docs/ru/
│
├── index.md
├── getting-started.md
├── cli.md
│
├── language/
│   ├── index.md
│   ├── syntax/
│   │   ├── indentation.md          — значимые отступы, INDENT/DEDENT
│   │   ├── asi.md                  — автоматическая расстановка ;
│   │   ├── comments.md             — // однострочные комментарии
│   │   └── line-continuation.md    — перенос строк через оператор / скобку
│   ├── functions/
│   │   ├── declaration.md          — f(x) = expr, базовый синтаксис
│   │   ├── multiline.md            — многострочное тело через отступы
│   │   ├── implicit-return.md      — неявный return: последнее выражение
│   │   ├── private.md              — _prefix: функция не попадает в .h
│   │   ├── mutability.md           — параметры иммутабельны, локальные — нет
│   │   └── multi-return.md         — возврат [a, b, c], \pm
│   ├── types/
│   │   ├── num.md                  — адаптивный тип, mc_num, precision
│   │   ├── int.md                  — только для индексов и счётчиков
│   │   ├── arrays.md               — num[], .length, скрытый параметр _len
│   │   ├── matrices.md             — num[][], .rows .cols, m[i][j] → плоский массив
│   │   └── slices.md               — m[:,j] срез столбца, m[i,:] срез строки
│   ├── where/
│   │   ├── definitions.md          — переменные в where-блоке
│   │   ├── guards.md               — guard clause → if(!cond) return NAN
│   │   └── order.md                — топологическая сортировка определений
│   ├── imports/
│   │   ├── basic.md                — import "./file.mc"
│   │   ├── namespaces.md           — import as ns → ns__func
│   │   └── collisions.md           — одинаковые имена в разных файлах
│   ├── constants/
│   │   ├── builtin.md              — π e τ φ ∞ nan
│   │   ├── global.md               — объявление на верхнем уровне файла
│   │   ├── folding.md              — constant folding: вычисление на этапе компиляции
│   │   └── priority.md             — приоритет: local > global > builtin
│   └── unicode/
│       ├── identifiers.md          — греческие буквы как имена переменных
│       ├── transliteration.md      — правила транслитерации в ASCII для Си
│       └── subscripts.md           — x_{i} нижние индексы
│
├── operators/
│   ├── index.md
│   ├── arithmetic/
│   │   ├── add.md                  — + сложение
│   │   ├── sub.md                  — - вычитание и унарный минус
│   │   ├── mul.md                  — * умножение
│   │   ├── div.md                  — / деление
│   │   ├── pow.md                  — ^ ** степень → pow()
│   │   ├── mod.md                  — mod % \mod → fmod()
│   │   ├── factorial.md            — n! постфиксный оператор
│   │   └── implicit-mul.md         — неявное умножение: 2x 2(a+b) 2πr
│   ├── comparison/
│   │   ├── eq.md                   — ==
│   │   ├── neq.md                  — != \neq \ne <>
│   │   ├── lt.md                   — <
│   │   ├── gt.md                   — >
│   │   ├── leq.md                  — <= \leq ≤
│   │   ├── geq.md                  — >= \geq ≥
│   │   └── chaining.md             — цепочки: a < b < c → (a<b)&&(b<c)
│   ├── logical/
│   │   ├── and.md                  — && and
│   │   ├── or.md                   — || or
│   │   └── not.md                  — ! not
│   └── special/
│       ├── abs.md                  — |x| \abs{x} \lvert x \rvert
│       ├── dot.md                  — ⋅ dispatch: num*num / dot product / matmul
│       ├── cross.md                — ⨯ \times векторное произведение
│       ├── set-in.md               — ∈ \in принадлежность множеству
│       ├── set-notin.md            — ∉ \notin отрицание принадлежности
│       ├── degrees.md              — 30° → 30 * (π/180)
│       └── pm.md                   — \pm → [+expr, -expr], возврат num[2]
│
├── functions/
│   ├── index.md
│   ├── trig/
│   │   ├── sin.md
│   │   ├── cos.md
│   │   ├── tan.md
│   │   ├── cot.md
│   │   ├── arcsin.md
│   │   ├── arccos.md
│   │   ├── arctan.md
│   │   ├── arccot.md
│   │   ├── sinh.md
│   │   ├── cosh.md
│   │   ├── tanh.md
│   │   └── coth.md
│   ├── exp-log/
│   │   ├── exp.md                  — e^x, exp(x)
│   │   ├── ln.md                   — \ln log → log(x)
│   │   ├── lg.md                   — \lg log10 → log10(x)
│   │   ├── log-base.md             — \log_{b}{x} → log(x)/log(b)
│   │   ├── sqrt.md                 — \sqrt{x} → sqrt(x)
│   │   └── sqrt-n.md               — \sqrt[n]{x} → pow(x, 1/n)
│   ├── rounding/
│   │   ├── floor.md                — \lfloor x \rfloor → floor(x)
│   │   ├── ceil.md                 — \lceil x \rceil → ceil(x)
│   │   ├── abs.md                  — abs(x) \abs{x} → fabs(x)
│   │   ├── sgn.md                  — sgn(x) \text{sgn} → (x>0)-(x<0)
│   │   └── fmod.md                 — fmod(a,b), mod, %
│   ├── combinatorics/
│   │   ├── factorial.md            — n! factorial(n)
│   │   ├── binom.md                — \binom{n}{k} binom(n,k)
│   │   ├── gcd.md                  — gcd(a,b) \gcd
│   │   └── lcm.md                  — lcm(a,b) \lcm
│   ├── special/
│   │   ├── erf.md                  — erf(x) \erf{x}
│   │   └── gamma.md                — gamma(x) \Gamma{x} → tgamma(x)
│   ├── aggregators/
│   │   ├── sum.md                  — sum(v), \sum_{x∈v}
│   │   ├── product.md              — product(v), \prod_{x∈v}
│   │   ├── mean.md                 — mean(v), \bar{v}
│   │   ├── std.md                  — std(v), \sigma{v}
│   │   ├── min.md                  — min(v) / min(a,b)
│   │   └── max.md                  — max(v) / max(a,b)
│   ├── vector/
│   │   ├── dot.md                  — dot(v, w) → mc_dot
│   │   ├── cross.md                — cross(v, w) → mc_cross3
│   │   └── norm.md                 — norm(v), \lVert v \rVert → mc_norm
│   ├── matrix/
│   │   ├── det.md                  — det(A), \det(A)
│   │   ├── inv.md                  — inv(A), A^{-1}
│   │   ├── transpose.md            — transpose(A), Aᵀ, A^{\top}
│   │   ├── zeros.md                — zeros(r, c)
│   │   ├── ones.md                 — ones(r, c)
│   │   ├── identity.md             — identity(n)
│   │   └── matmul.md               — A ⋅ B матричное умножение
│   ├── calculus/
│   │   ├── integral.md             — \int{a}{b} f(x) dx → Симпсон
│   │   ├── limit.md                — \lim{x \to a} expr
│   │   └── derivative.md           — \frac{d}{dx} f(x) → конечные разности
│   └── interp.md                   — interp(x, xs, ys) линейная интерполяция
│
├── latex/
│   ├── index.md
│   ├── arithmetic/
│   │   ├── frac.md                 — \frac{a}{b}
│   │   ├── sqrt.md                 — \sqrt{x}
│   │   ├── sqrt-n.md               — \sqrt[n]{x}
│   │   ├── abs.md                  — \abs{x}, \lvert x \rvert
│   │   ├── floor.md                — \lfloor x \rfloor
│   │   ├── ceil.md                 — \lceil x \rceil
│   │   ├── pm.md                   — \pm expr
│   │   ├── mod.md                  — a \mod b
│   │   └── binom.md                — \binom{n}{k}
│   ├── trig/
│   │   ├── sin.md                  — \sin{x}
│   │   ├── cos.md                  — \cos{x}
│   │   ├── tan.md                  — \tan{x} \tg{x}
│   │   ├── cot.md                  — \cot{x} \ctg{x}
│   │   ├── arcsin.md               — \arcsin{x}
│   │   ├── arccos.md               — \arccos{x}
│   │   ├── arctan.md               — \arctan{x} \arctg{x}
│   │   ├── arccot.md               — \arccot{x} \arcctg{x}
│   │   ├── sinh.md                 — \sinh{x} \sh{x}
│   │   ├── cosh.md                 — \cosh{x} \ch{x}
│   │   ├── tanh.md                 — \tanh{x} \th{x}
│   │   └── coth.md                 — \coth{x} \cth{x}
│   ├── exp-log/
│   │   ├── ln.md                   — \ln{x}
│   │   ├── lg.md                   — \lg{x}
│   │   └── log-base.md             — \log_{b}{x}
│   ├── sums/
│   │   ├── sum-range.md            — \sum_{i=a}^{b} expr
│   │   ├── sum-array.md            — \sum_{x \in v} expr
│   │   ├── prod-range.md           — \prod_{i=a}^{b} expr
│   │   └── prod-array.md           — \prod_{x \in v} expr
│   ├── calculus/
│   │   ├── integral.md             — \int{a}{b} expr dx
│   │   ├── limit.md                — \lim{x \to a} expr
│   │   └── derivative.md           — \frac{d}{dx} expr
│   ├── matrix/
│   │   ├── cdot.md                 — \cdot (dispatch по типу)
│   │   ├── times.md                — \times ⨯
│   │   ├── det.md                  — \det(A)
│   │   ├── transpose.md            — \top ^{\top}
│   │   └── inv.md                  — ^{-1}
│   ├── cases.md                    — \begin{cases} ... \end{cases}
│   ├── greek/
│   │   ├── lowercase.md            — α β γ δ ε ζ η θ λ μ ν ξ ρ σ τ υ χ ψ ω
│   │   └── uppercase.md            — Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω
│   ├── sets/
│   │   ├── in.md                   — \in ∈
│   │   ├── notin.md                — \notin ∉
│   │   ├── naturals.md             — \mathbb{N} ℕ
│   │   ├── integers.md             — \mathbb{Z} ℤ
│   │   ├── reals.md                — \mathbb{R} ℝ
│   │   └── complex.md              — \mathbb{C} ℂ
│   ├── comparison/
│   │   ├── neq.md                  — \neq \ne !=
│   │   ├── leq.md                  — \leq ≤
│   │   ├── geq.md                  — \geq ≥
│   │   └── lvert.md                — \lvert x \rvert |x|
│   └── constants/
│       ├── pi.md                   — \pi π
│       ├── tau.md                  — \tau τ
│       ├── phi.md                  — \phi φ
│       └── infty.md                — \infty ∞ inf
│
└── integration/
    ├── c/
    │   ├── include.md              — #include "file.h", mc_num typedef
    │   ├── compile.md              — gcc file.c lib.c -lm -o app
    │   ├── arrays.md               — передача массивов, скрытый _len
    │   └── shared.md               — shared library .so .dll, -shared -fPIC
    ├── python/
    │   ├── load.md                 — ctypes.CDLL, путь к .dll/.so
    │   ├── scalars.md              — argtypes restype c_double
    │   ├── arrays.md               — POINTER, c_double*N, передача массивов
    │   └── multireturn.md          — получение num[2] из \pm
    └── js/
        ├── emcc.md                 — команда сборки, EXPORTED_FUNCTIONS, флаги
        ├── cwrap.md                — Module.cwrap, типы аргументов
        ├── heap.md                 — HEAPF64, _malloc, _free, wasm heap
        └── module.md              — onRuntimeInitialized, CJS vs ESM, package.json
```

---

## Итого файлов

| Раздел         | Файлов |
|----------------|--------|
| Корень         | 3      |
| language/      | 29     |
| operators/     | 24     |
| functions/     | 40     |
| latex/         | 46     |
| integration/   | 11     |
| index.md файлы | 6      |
| **Итого**      | **159**|

---

## Приоритет написания

### Фаза 1 — Каркас (3 файла)
`index.md`, `getting-started.md`, `cli.md`

### Фаза 2 — Язык (29 файлов)
`language/**`

### Фаза 3 — Операторы (24 файла)
`operators/**`

### Фаза 4 — Встроенные функции (40 файлов)
`functions/**`

### Фаза 5 — LaTeX-справочник (46 файлов)
`latex/**`

### Фаза 6 — Интеграция (11 файлов)
`integration/**`
