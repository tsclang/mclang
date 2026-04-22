# std — стандартное отклонение

---

## Сигнатура

```mc
std(v: num[]) → num
\sigma{v}            // LaTeX-синоним
```

Вычисляет **генеральное** стандартное отклонение (делит на `n`, не `n-1`).

---

## Пример

```mc
f(v: num[]) = std(v)
// std([2, 4, 4, 4, 5, 5, 7, 9]) → 2.0
```

```c
static inline mc_num mc_std(const mc_num* v, int n) {
    if (n <= 0) return 0.0;
    mc_num m = mc_mean(v, n), s = 0.0;
    for (int i = 0; i < n; i++) s += (v[i] - m) * (v[i] - m);
    return sqrt(s / n);
}
```

---

## Применение

```mc
// Коэффициент вариации
cv(v: num[]) = std(v) / mean(v)

// Z-score
zscore(v: num[], x) = (x - mean(v)) / std(v)
```

---

## Выборочное СО (делить на n-1)

```mc
sample_std(v: num[]) =
    sqrt(s / (n - 1))
    where
        n = v.length
        m = mean(v)
        diffs = v - m
        s = sum(diffs .* diffs)
```

---

## Смотри aussi

- [mean](mean.md) · [sum](sum.md)
