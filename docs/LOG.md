# Лог написания документации docs/ru

Статусы: `[ ]` не начато · `[~]` в работе · `[x]` готово

---

## Фаза 1 — Каркас

- [x] `ru/index.md`              — главная страница, навигация по всем разделам
- [x] `ru/getting-started.md`    — установка, первый .mc файл, компиляция, запуск
- [x] `ru/cli.md`                — mclang <file> --target --precision, exit codes

---

## Фаза 2 — Язык (`ru/language/`)

### Синтаксис
- [x] `language/index.md`
- [x] `language/syntax/indentation.md`       — значимые отступы, INDENT/DEDENT
- [x] `language/syntax/asi.md`               — автоматическая расстановка ;
- [x] `language/syntax/comments.md`          — // однострочные комментарии
- [x] `language/syntax/line-continuation.md` — перенос строк

### Функции
- [x] `language/functions/declaration.md`    — f(x) = expr
- [x] `language/functions/multiline.md`      — многострочное тело
- [x] `language/functions/implicit-return.md`— неявный return
- [x] `language/functions/private.md`        — _prefix, не попадает в .h
- [x] `language/functions/mutability.md`     — параметры иммутабельны
- [x] `language/functions/multi-return.md`   — возврат [a, b, c]

### Типы
- [x] `language/types/num.md`                — адаптивный тип, mc_num
- [x] `language/types/int.md`                — только для индексов
- [x] `language/types/arrays.md`             — num[], .length, скрытый _len
- [x] `language/types/matrices.md`           — num[][], .rows .cols
- [x] `language/types/slices.md`             — m[:,j] m[i,:]

### Where
- [x] `language/where/definitions.md`        — переменные в where
- [x] `language/where/guards.md`             — guard → return NAN
- [x] `language/where/order.md`              — топологическая сортировка

### Импорты
- [x] `language/imports/basic.md`            — import "./file.mc"
- [x] `language/imports/namespaces.md`       — import as ns
- [x] `language/imports/collisions.md`       — коллизии имён

### Константы
- [x] `language/constants/builtin.md`        — π e τ φ ∞ nan
- [x] `language/constants/global.md`         — объявление на верхнем уровне
- [x] `language/constants/folding.md`        — constant folding
- [x] `language/constants/priority.md`       — local > global > builtin

### Unicode
- [x] `language/unicode/identifiers.md`      — греческие буквы как имена
- [x] `language/unicode/transliteration.md`  — транслитерация в ASCII
- [x] `language/unicode/subscripts.md`       — x_{i} нижние индексы

---

## Фаза 3 — Операторы (`ru/operators/`)

- [x] `operators/index.md`

### Арифметика
- [x] `operators/arithmetic/add.md`          — +
- [x] `operators/arithmetic/sub.md`          — - и унарный минус
- [x] `operators/arithmetic/mul.md`          — *
- [x] `operators/arithmetic/div.md`          — /
- [x] `operators/arithmetic/pow.md`          — ^ **
- [x] `operators/arithmetic/mod.md`          — mod % \mod
- [x] `operators/arithmetic/factorial.md`    — n!
- [x] `operators/arithmetic/implicit-mul.md` — 2x 2πr неявное умножение

### Сравнение
- [x] `operators/comparison/eq.md`           — ==
- [x] `operators/comparison/neq.md`          — != \neq \ne <>
- [x] `operators/comparison/lt.md`           — <
- [x] `operators/comparison/gt.md`           — >
- [x] `operators/comparison/leq.md`          — <= \leq ≤
- [x] `operators/comparison/geq.md`          — >= \geq ≥
- [x] `operators/comparison/chaining.md`     — цепочки a < b < c

### Логика
- [x] `operators/logical/and.md`             — && and
- [x] `operators/logical/or.md`              — || or
- [x] `operators/logical/not.md`             — ! not

### Специальные
- [x] `operators/special/abs.md`             — |x| \abs{x}
- [x] `operators/special/dot.md`             — ⋅ dispatch
- [x] `operators/special/cross.md`           — ⨯ \times
- [x] `operators/special/set-in.md`          — ∈ \in
- [x] `operators/special/set-notin.md`       — ∉ \notin
- [x] `operators/special/degrees.md`         — 30°
- [x] `operators/special/pm.md`              — \pm

---

## Фаза 4 — Функции (`ru/functions/`)

- [x] `functions/index.md`

### Тригонометрия
- [x] `functions/trig/sin.md`
- [x] `functions/trig/cos.md`
- [x] `functions/trig/tan.md`
- [x] `functions/trig/cot.md`
- [x] `functions/trig/arcsin.md`
- [x] `functions/trig/arccos.md`
- [x] `functions/trig/arctan.md`
- [x] `functions/trig/arccot.md`
- [x] `functions/trig/sinh.md`
- [x] `functions/trig/cosh.md`
- [x] `functions/trig/tanh.md`
- [x] `functions/trig/coth.md`

### Степени и логарифмы
- [x] `functions/exp-log/exp.md`
- [x] `functions/exp-log/ln.md`
- [x] `functions/exp-log/lg.md`
- [x] `functions/exp-log/log-base.md`
- [x] `functions/exp-log/sqrt.md`
- [x] `functions/exp-log/sqrt-n.md`

### Округление
- [x] `functions/rounding/floor.md`
- [x] `functions/rounding/ceil.md`
- [x] `functions/rounding/abs.md`
- [x] `functions/rounding/sgn.md`
- [x] `functions/rounding/fmod.md`

### Комбинаторика
- [x] `functions/combinatorics/factorial.md`
- [x] `functions/combinatorics/binom.md`
- [x] `functions/combinatorics/gcd.md`
- [x] `functions/combinatorics/lcm.md`

### Специальные
- [x] `functions/special/erf.md`
- [x] `functions/special/gamma.md`

### Агрегаторы
- [x] `functions/aggregators/sum.md`
- [x] `functions/aggregators/product.md`
- [x] `functions/aggregators/mean.md`
- [x] `functions/aggregators/std.md`
- [x] `functions/aggregators/min.md`
- [x] `functions/aggregators/max.md`

### Векторные
- [x] `functions/vector/dot.md`
- [x] `functions/vector/cross.md`
- [x] `functions/vector/norm.md`

### Матричные
- [x] `functions/matrix/det.md`
- [x] `functions/matrix/inv.md`
- [x] `functions/matrix/transpose.md`
- [x] `functions/matrix/zeros.md`
- [x] `functions/matrix/ones.md`
- [x] `functions/matrix/identity.md`
- [x] `functions/matrix/matmul.md`

### Математический анализ
- [x] `functions/calculus/integral.md`
- [x] `functions/calculus/limit.md`
- [x] `functions/calculus/derivative.md`

### Прочее
- [x] `functions/interp.md`

---

## Фаза 5 — LaTeX-справочник (`ru/latex/`)

- [x] `latex/index.md`

### Арифметика
- [x] `latex/arithmetic/frac.md`             — \frac{a}{b}
- [x] `latex/arithmetic/sqrt.md`             — \sqrt{x}
- [x] `latex/arithmetic/sqrt-n.md`           — \sqrt[n]{x}
- [x] `latex/arithmetic/abs.md`              — \abs{x} \lvert x \rvert
- [x] `latex/arithmetic/floor.md`            — \lfloor x \rfloor
- [x] `latex/arithmetic/ceil.md`             — \lceil x \rceil
- [x] `latex/arithmetic/pm.md`               — \pm expr
- [x] `latex/arithmetic/mod.md`              — a \mod b
- [x] `latex/arithmetic/binom.md`            — \binom{n}{k}

### Тригонометрия
- [x] `latex/trig/sin.md`
- [x] `latex/trig/cos.md`
- [x] `latex/trig/tan.md`
- [x] `latex/trig/cot.md`
- [x] `latex/trig/arcsin.md`
- [x] `latex/trig/arccos.md`
- [x] `latex/trig/arctan.md`
- [x] `latex/trig/arccot.md`
- [x] `latex/trig/sinh.md`
- [x] `latex/trig/cosh.md`
- [x] `latex/trig/tanh.md`
- [x] `latex/trig/coth.md`

### Степени и логарифмы
- [x] `latex/exp-log/ln.md`                  — \ln{x}
- [x] `latex/exp-log/lg.md`                  — \lg{x}
- [x] `latex/exp-log/log-base.md`            — \log_{b}{x}

### Суммы и произведения
- [x] `latex/sums/sum-range.md`              — \sum_{i=a}^{b}
- [x] `latex/sums/sum-array.md`              — \sum_{x \in v}
- [x] `latex/sums/prod-range.md`             — \prod_{i=a}^{b}
- [x] `latex/sums/prod-array.md`             — \prod_{x \in v}

### Математический анализ
- [x] `latex/calculus/integral.md`           — \int{a}{b} expr dx
- [x] `latex/calculus/limit.md`              — \lim{x \to a}
- [x] `latex/calculus/derivative.md`         — \frac{d}{dx}

### Матрицы
- [x] `latex/matrix/cdot.md`                 — \cdot
- [x] `latex/matrix/times.md`               — \times ⨯
- [x] `latex/matrix/det.md`                  — \det(A)
- [x] `latex/matrix/transpose.md`            — \top ^{\top}
- [x] `latex/matrix/inv.md`                  — ^{-1}

### Кусочные функции
- [x] `latex/cases.md`                       — \begin{cases}

### Греческие буквы
- [x] `latex/greek/lowercase.md`             — α β γ δ ... ω
- [x] `latex/greek/uppercase.md`             — Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω

### Множества
- [x] `latex/sets/in.md`                     — \in ∈
- [x] `latex/sets/notin.md`                  — \notin ∉
- [x] `latex/sets/naturals.md`               — \mathbb{N} ℕ
- [x] `latex/sets/integers.md`               — \mathbb{Z} ℤ
- [x] `latex/sets/reals.md`                  — \mathbb{R} ℝ
- [x] `latex/sets/complex.md`                — \mathbb{C} ℂ

### Сравнение
- [x] `latex/comparison/neq.md`              — \neq \ne
- [x] `latex/comparison/leq.md`              — \leq ≤
- [x] `latex/comparison/geq.md`              — \geq ≥
- [x] `latex/comparison/lvert.md`            — \lvert x \rvert

### Константы
- [x] `latex/constants/pi.md`                — \pi π
- [x] `latex/constants/tau.md`               — \tau τ
- [x] `latex/constants/phi.md`               — \phi φ
- [x] `latex/constants/infty.md`             — \infty ∞ inf

---

## Фаза 6 — Интеграция (`ru/integration/`)

### C
- [x] `integration/c/include.md`             — #include "file.h", mc_num
- [x] `integration/c/compile.md`             — gcc, -lm, линковка
- [x] `integration/c/arrays.md`              — передача массивов, _len
- [x] `integration/c/shared.md`              — .so .dll, -shared -fPIC

### Python
- [x] `integration/python/load.md`           — ctypes.CDLL
- [x] `integration/python/scalars.md`        — argtypes, restype, c_double
- [x] `integration/python/arrays.md`         — POINTER, массивы
- [x] `integration/python/multireturn.md`    — получение num[2]

### JavaScript
- [x] `integration/js/emcc.md`               — emcc, EXPORTED_FUNCTIONS
- [x] `integration/js/cwrap.md`              — Module.cwrap
- [x] `integration/js/heap.md`               — HEAPF64, _malloc, _free
- [x] `integration/js/module.md`             — CJS vs ESM, package.json

---

## Прогресс

| Фаза | Файлов | Готово |
|------|--------|--------|
| 1. Каркас | 3 | 3 |
| 2. Язык | 29 | 29 |
| 3. Операторы | 24 | 24 |
| 4. Функции | 40 | 40 |
| 5. LaTeX | 46 | 46 |
| 6. Интеграция | 11 | 11 |
| index.md файлы | 6 | 6 |
| **Итого** | **159** | **159** |
