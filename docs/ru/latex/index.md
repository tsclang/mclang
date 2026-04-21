# LaTeX-справочник

Полный список LaTeX-конструкций, поддерживаемых mclang, с примерами и генерируемым Си-кодом.

---

## Арифметика

| LaTeX | mclang | Си |
|-------|--------|----|
| [`\frac{a}{b}`](arithmetic/frac.md) | `a / b` | `a / b` |
| [`\sqrt{x}`](arithmetic/sqrt.md) | `sqrt(x)` | `sqrt(x)` |
| [`\sqrt[n]{x}`](arithmetic/sqrt-n.md) | `sqrt(n, x)` | `pow(x, 1.0/n)` |
| [`\abs{x}`](arithmetic/abs.md) | `abs(x)` | `fabs(x)` |
| [`\lfloor x \rfloor`](arithmetic/floor.md) | `floor(x)` | `floor(x)` |
| [`\lceil x \rceil`](arithmetic/ceil.md) | `ceil(x)` | `ceil(x)` |
| [`\pm expr`](arithmetic/pm.md) | `\pm e` | `[+e, -e]` |
| [`a \mod b`](arithmetic/mod.md) | `a % b` | `fmod(a, b)` |
| [`\binom{n}{k}`](arithmetic/binom.md) | `binom(n, k)` | `mc_binom(n, k)` |

---

## Тригонометрия

| LaTeX | Функция |
|-------|---------|
| [`\sin`, `\cos`, `\tan`, `\cot`](trig/sin.md) | тригонометрические |
| [`\arcsin`, `\arccos`, `\arctan`](trig/arcsin.md) | обратные |
| [`\sinh`, `\cosh`, `\tanh`](trig/sinh.md) | гиперболические |

---

## Степени и логарифмы

| LaTeX | Функция |
|-------|---------|
| [`\ln{x}`](exp-log/ln.md) | `ln(x)` |
| [`\lg{x}`](exp-log/lg.md) | `lg(x)` |
| [`\log_{b}{x}`](exp-log/log-base.md) | `log(b, x)` |

---

## Суммы и произведения

| LaTeX | Описание |
|-------|----------|
| [`\sum_{i=a}^{b}`](sums/sum-range.md) | сумма по диапазону |
| [`\sum_{x \in v}`](sums/sum-array.md) | сумма по массиву |
| [`\prod_{i=a}^{b}`](sums/prod-range.md) | произведение по диапазону |
| [`\prod_{x \in v}`](sums/prod-array.md) | произведение по массиву |

---

## Математический анализ

| LaTeX | Описание |
|-------|----------|
| [`\int{a}{b} f dx`](calculus/integral.md) | числовое интегрирование |
| [`\lim{x \to a}`](calculus/limit.md) | предел |
| [`\frac{d}{dx}`](calculus/derivative.md) | численная производная |

---

## Матрицы

| LaTeX | Описание |
|-------|----------|
| [`\cdot`](matrix/cdot.md) | диспатч-умножение |
| [`\times`](matrix/times.md) | векторное произведение |
| [`\det(A)`](matrix/det.md) | определитель |
| [`A^\top`](matrix/transpose.md) | транспонирование |
| [`A^{-1}`](matrix/inv.md) | обратная матрица |

---

## Кусочные функции

| LaTeX | Описание |
|-------|----------|
| [`\begin{cases}`](cases.md) | piecewise / CasesExpr |

---

## Греческие буквы

| LaTeX | Символ |
|-------|--------|
| [`\alpha` … `\omega`](greek/lowercase.md) | α β γ … ω |
| [`\Gamma` … `\Omega`](greek/uppercase.md) | Γ Δ Θ … Ω |

---

## Множества

| LaTeX | Символ | Условие |
|-------|--------|---------|
| [`\in`](sets/in.md) | ∈ | принадлежность |
| [`\notin`](sets/notin.md) | ∉ | непринадлежность |
| [`\mathbb{N}`](sets/naturals.md) | ℕ | натуральные |
| [`\mathbb{Z}`](sets/integers.md) | ℤ | целые |
| [`\mathbb{R}`](sets/reals.md) | ℝ | вещественные |
| [`\mathbb{C}`](sets/complex.md) | ℂ | комплексные |

---

## Сравнение

| LaTeX | Символ |
|-------|--------|
| [`\neq`, `\ne`](comparison/neq.md) | ≠ |
| [`\leq`](comparison/leq.md) | ≤ |
| [`\geq`](comparison/geq.md) | ≥ |
| [`\lvert x \rvert`](comparison/lvert.md) | |x| |

---

## Константы

| LaTeX | Константа |
|-------|-----------|
| [`\pi`](constants/pi.md) | π = 3.14159… |
| [`\tau`](constants/tau.md) | τ = 6.28318… |
| [`\phi`](constants/phi.md) | φ = 1.61803… |
| [`\infty`](constants/infty.md) | ∞ |
