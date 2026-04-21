# sum — сумма элементов массива

---

## Сигнатура

```mc
sum(v: num[]) → num
```

---

## Пример

```mc
total(v: num[]) = sum(v)
```

```c
static inline mc_num mc_sum(const mc_num* v, int n) {
    mc_num s = 0.0;
    for (int i = 0; i < n; i++) s += v[i];
    return s;
}
```

---

## Применение

```mc
// Среднее
mean(v: num[]) = sum(v) / v.length

// Взвешенная сумма
weighted(v: num[], w: num[]) = sum(v .* w)

// Суммирование по условию (filter через where)
positive_sum(v: num[]) =
    acc = 0
    for i in 0..v.length - 1
        if (v[i] > 0)
            acc = acc + v[i]
    acc
```

---

## Смотри aussi

- [product](product.md) · [mean](mean.md)
- [∑ оператор](../../latex/sums/sum-range.md)
