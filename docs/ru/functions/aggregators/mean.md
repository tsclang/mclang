# mean — среднее арифметическое

---

## Сигнатура

```mc
mean(v: num[]) → num
```

---

## Пример

```mc
f(v: num[]) = mean(v)
// mean([1, 2, 3, 4, 5]) → 3.0
```

```c
static inline mc_num mc_mean(const mc_num* v, int n) {
    return n > 0 ? mc_sum(v, n) / n : 0.0;
}
```

---

## Применение

```mc
// Отклонение от среднего
deviations(v: num[]) = v - mean(v)

// Нормализация z-score
zscore(v: num[]) =
    (v - mean(v)) / std(v)
```

---

## Смотри aussi

- [std](std.md) · [sum](sum.md)
