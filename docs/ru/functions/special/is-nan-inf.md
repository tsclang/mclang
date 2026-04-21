# is_nan, is_inf, is_finite

Функции проверки числовых состояний.

---

## Синтаксис

```mc
is_nan(x)       // x == NaN
is_inf(x)       // x == ±∞
is_finite(x)    // x не NaN и не ∞
```

---

## Примеры

```mc
safe_log(x) =
    if is_nan(x) then nan
    else if x <= 0 then nan
    else log(x)
```

```mc
clamp_finite(x, lo, hi) =
    if is_finite(x) then clamp(x, lo, hi) else 0
```

```mc
is_valid(x) = is_finite(x)
```

---

## Генерируемый C-код

| mclang | C |
|--------|---|
| `is_nan(x)` | `isnan(x)` |
| `is_inf(x)` | `isinf(x)` |
| `is_finite(x)` | `isfinite(x)` |

Требует `#include <math.h>` — mclang добавляет его автоматически.

---

## Когда возникают NaN и Inf

| Выражение | Результат |
|-----------|-----------|
| `0 / 0` | `NaN` |
| `1 / 0` | `Inf` |
| `sqrt(-1)` | `NaN` |
| `log(-1)` | `NaN` |
| `nan` | `NaN` (литерал) |
| `inf` | `Inf` (литерал) |

Guards в блоке `where` возвращают `NAN` при нарушении условия — используй `is_nan` для проверки результата вызывающей стороны.

---

## Смотри также

- [nan, inf](../../../language/constants/builtin.md)
- [Guards (where)](../../../language/where/guards.md)
