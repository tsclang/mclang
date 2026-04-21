# \sum_{x \in v} — сумма по массиву

---

## Синтаксис

```latex
\sum_{x \in v} expr
```

---

## Трансляция

```mc
\sum_{x \in v} x^2
```

```c
mc_num _sum = 0.0;
for (int _i = 0; _i < v_len; _i++) {
    mc_num x = v[_i];
    _sum += pow(x, 2.0);
}
```

---

## Примеры

```mc
// Квадрат нормы через суммирование
norm_sq(v: num[]) = \sum_{x \in v} x^2

// Взвешенная сумма
weighted(v: num[], w: num[]) = \sum_{i \in 0..v.length-1} v[i] * w[i]
```

---

## Смотри aussi

- [\sum по диапазону](sum-range.md) · [\prod по массиву](prod-array.md)
