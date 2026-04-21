# \infty — ∞ (бесконечность)

---

## Синтаксис

```latex
\infty
∞      // Unicode
inf    // словесный синоним
```

---

## Трансляция

```c
INFINITY   // из <math.h>
```

Отрицательная бесконечность: `-\infty` → `-INFINITY`.

---

## Примеры

```mc
safe_inv(x) =
    if (x == 0) \infty
    1 / x

f(x) = \lim{x \to \infty} 1/x   // → 0
```

---

## Проверка

```mc
is_inf(x)     // 1 если x = ±∞
is_finite(x)  // 1 если x ≠ ±∞ и x ≠ nan
```

---

## Смотри aussi

- [\pi](pi.md) · [Встроенные константы](../../language/constants/builtin.md)
- [is_inf](../../functions/special/erf.md)
