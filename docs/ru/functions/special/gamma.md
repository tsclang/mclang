# gamma — гамма-функция

---

## Сигнатура

```mc
gamma(x: num) → num
\Gamma{x}           // LaTeX (когда за \Gamma следует {)
tgamma(x)           // Си-синоним (напрямую)
```

---

## Пример

```mc
f(x) = gamma(x)
```

```c
mc_num f(mc_num x) { return tgamma(x); }
```

---

## Определение

Обобщение факториала: `gamma(n) = (n-1)!` для натуральных `n`.

| x | gamma(x) |
|---|----------|
| 1 | 1 |
| 2 | 1 |
| 3 | 2 |
| 4 | 6 |
| 0.5 | √π ≈ 1.7725 |

---

## Применение

```mc
// Обобщённый факториал
gen_factorial(x) = gamma(x + 1)

// Бета-функция
beta(a, b) = gamma(a) * gamma(b) / gamma(a + b)
```

---

## Ошибки

При `x = 0, -1, -2, ...` → `±∞` (полюсы гамма-функции).

---

## Смотри aussi

- [erf](erf.md)
- [factorial](../combinatorics/factorial.md)
