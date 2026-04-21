# min — минимум

---

## Сигнатуры

```mc
min(v: num[]) → num      // минимум по массиву
min(a: num, b: num) → num // минимум двух значений
```

---

## Пример

```mc
f(v: num[]) = min(v)
g(a, b) = min(a, b)
```

```c
// Массив
static inline mc_num mc_min_arr(const mc_num* v, int n) {
    if (n <= 0) return NAN;
    mc_num m = v[0];
    for (int i = 1; i < n; i++) if (v[i] < m) m = v[i];
    return m;
}
// Два значения
mc_num min_two(mc_num a, mc_num b) { return a < b ? a : b; }
```

---

## Применение

```mc
// Обрезание снизу (clamp)
clamp_lo(x, lo) = max(x, lo)
clamp(x, lo, hi) = min(max(x, lo), hi)
```

---

## Смотри aussi

- [max](max.md)
