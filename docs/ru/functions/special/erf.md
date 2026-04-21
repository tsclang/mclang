# erf — функция ошибок; is_nan, is_inf, is_finite

---

## erf

### Сигнатура

```mc
erf(x: num) → num
```

```c
mc_num f(mc_num x) { return erf(x); }
```

Значения: `(-1, 1)`. `erf(0) = 0`, `erf(∞) = 1`.

### Применение

```mc
// Интеграл Гаусса (вероятность нормального распределения)
normal_cdf(x, mu, sigma) =
    0.5 * (1 + erf((x - mu) / (sigma * sqrt(2))))
```

---

## is_nan

### Сигнатура

```mc
is_nan(x: num) → num   // 1.0 или 0.0
```

```c
mc_num is_nan(mc_num x) { return isnan(x) ? 1.0 : 0.0; }
```

### Пример

```mc
safe_check(x) =
    if (is_nan(x)) 0.0
    else x
```

---

## is_inf

### Сигнатура

```mc
is_inf(x: num) → num
```

```c
mc_num is_inf(mc_num x) { return isinf(x) ? 1.0 : 0.0; }
```

---

## is_finite

### Сигнатура

```mc
is_finite(x: num) → num
```

```c
mc_num is_finite(mc_num x) { return isfinite(x) ? 1.0 : 0.0; }
```

### Пример

```mc
safe_result(x) =
    if (is_finite(x)) x
    else 0.0
```

---

## Смотри aussi

- [gamma](gamma.md)
- [nan, inf](../../language/constants/builtin.md)
