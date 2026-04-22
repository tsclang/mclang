# Встроенные функции

Все встроенные функции mclang с сигнатурами и Си-эквивалентами.

---

## Тригонометрия

| Функция | Аргумент | Си | Описание |
|---------|----------|----|----------|
| [sin(x)](trig/sin.md) | радианы | `sin(x)` | Синус |
| [cos(x)](trig/cos.md) | радианы | `cos(x)` | Косинус |
| [tan(x)](trig/tan.md) | радианы | `tan(x)` | Тангенс |
| [cot(x)](trig/cot.md) | радианы | `1/tan(x)` | Котангенс |
| [sec(x)](trig/sec.md) | радианы | `1/cos(x)` | Секанс |
| [csc(x)](trig/csc.md) | радианы | `1/sin(x)` | Косеканс |
| [arcsin(x)](trig/arcsin.md) | [-1,1] | `asin(x)` | Арксинус |
| [arccos(x)](trig/arccos.md) | [-1,1] | `acos(x)` | Арккосинус |
| [arctan(x)](trig/arctan.md) | ℝ | `atan(x)` | Арктангенс |
| [arctan2(y,x)](trig/arctan.md) | ℝ² | `atan2(y,x)` | Двухаргументный |
| [arccot(x)](trig/arccot.md) | ℝ | `atan2(1,x)` | Арккотангенс |
| [sinh(x)](trig/sinh.md) | ℝ | `sinh(x)` | Гиперболический синус |
| [cosh(x)](trig/cosh.md) | ℝ | `cosh(x)` | Гиперболический косинус |
| [tanh(x)](trig/tanh.md) | ℝ | `tanh(x)` | Гиперболический тангенс |
| [coth(x)](trig/coth.md) | ℝ | `1/tanh(x)` | Гиперболический котангенс |
| [asinh(x)](trig/asinh-acosh-atanh.md) | ℝ | `asinh(x)` | Обратный sinh |
| [acosh(x)](trig/asinh-acosh-atanh.md) | [1,∞) | `acosh(x)` | Обратный cosh |
| [atanh(x)](trig/asinh-acosh-atanh.md) | (-1,1) | `atanh(x)` | Обратный tanh |

Синонимы: `tg` = `tan`, `ctg` = `cot`, `sh` = `sinh`, `ch` = `cosh`, `th` = `tanh`, `arcsh` = `asinh`, `arcch` = `acosh`, `arcth` = `atanh`.

---

## Степени и логарифмы

| Функция | Си | Описание |
|---------|----|----------|
| [exp(x)](exp-log/exp.md) | `exp(x)` | e^x |
| [ln(x)](exp-log/ln.md) | `log(x)` | Натуральный логарифм |
| [lg(x)](exp-log/lg.md) | `log10(x)` | Десятичный логарифм |
| [log2(x)](exp-log/log2.md) | `log2(x)` | Логарифм по основанию 2 |
| [log(base, x)](exp-log/log-base.md) | `log(x)/log(base)` | Логарифм по основанию |
| [sqrt(x)](exp-log/sqrt.md) | `sqrt(x)` | Квадратный корень |
| [cbrt(x)](exp-log/cbrt.md) | `cbrt(x)` | Кубический корень |
| [sqrt(n, x)](exp-log/sqrt-n.md) | `pow(x, 1.0/n)` | Корень n-й степени |

---

## Округление

| Функция | Си | Описание |
|---------|----|----------|
| [floor(x)](rounding/floor.md) | `floor(x)` | Округление вниз |
| [ceil(x)](rounding/ceil.md) | `ceil(x)` | Округление вверх |
| [round(x)](rounding/floor.md) | `round(x)` | Округление к ближайшему |
| [trunc(x)](rounding/trunc.md) | `trunc(x)` | Усечение к нулю |
| [abs(x)](rounding/abs.md) | `fabs(x)` | Модуль |
| [sgn(x)](rounding/sgn.md) | `mc_sgn(x)` | Знак (`sign` — синоним) |
| [fmod(x,y)](rounding/fmod.md) | `fmod(x,y)` | Остаток с плавающей точкой |

---

## Комбинаторика

| Функция | Описание |
|---------|----------|
| [factorial(n)](combinatorics/factorial.md) | n! |
| [binom(n, k)](combinatorics/binom.md) | Биномиальный коэффициент |
| [gcd(a, b)](combinatorics/gcd.md) | НОД |
| [lcm(a, b)](combinatorics/lcm.md) | НОК |

---

## Специальные

| Функция | Си | Описание |
|---------|----|----------|
| [erf(x)](special/erf.md) | `erf(x)` | Функция ошибок |
| [erfc(x)](special/erfc.md) | `erfc(x)` | Дополнительная функция ошибок |
| [gamma(x)](special/gamma.md) | `tgamma(x)` | Гамма-функция |
| [is_nan(x)](special/is-nan-inf.md) | `isnan(x)` | Проверка NaN |
| [is_inf(x)](special/is-nan-inf.md) | `isinf(x)` | Проверка бесконечности |
| [is_finite(x)](special/is-nan-inf.md) | `isfinite(x)` | Проверка конечности |
| [solve(var, lo, hi) { }](special/solve.md) | bisection | Численное решение уравнений |

---

## Агрегаторы (для массивов)

| Функция | Описание |
|---------|----------|
| [sum(v)](aggregators/sum.md) | Сумма элементов |
| [product(v)](aggregators/product.md) | Произведение элементов |
| [mean(v)](aggregators/mean.md) | Среднее |
| [std(v)](aggregators/std.md) | Стандартное отклонение |
| [min(v)](aggregators/min.md) | Минимум |
| [max(v)](aggregators/max.md) | Максимум |

---

## Векторные

| Функция | Описание |
|---------|----------|
| [dot(a, b)](vector/dot.md) | Скалярное произведение |
| [cross(a, b)](vector/cross.md) | Векторное произведение |
| [norm(v)](vector/norm.md) | Евклидова норма |
| [hypot(x, y)](vector/hypot.md) | Гипотенуза √(x²+y²) |

---

## Матричные

| Функция | Описание |
|---------|----------|
| [det(A)](matrix/det.md) | Определитель |
| [inv(A)](matrix/inv.md) | Обратная матрица |
| [transpose(A)](matrix/transpose.md) | Транспонирование |
| [zeros(r, c)](matrix/zeros.md) | Нулевая матрица |
| [ones(r, c)](matrix/ones.md) | Единичная матрица (все 1) |
| [I(n)](matrix/identity.md) | Единичная матрица |

---

## Математический анализ

| Функция | Описание |
|---------|----------|
| [\int{a}{b} f dx](calculus/integral.md) | Числовое интегрирование (Симпсон) |
| [\lim{x→a} f](calculus/limit.md) | Предел в точке |
| [\frac{d}{dx} f](calculus/derivative.md) | Численная производная |

