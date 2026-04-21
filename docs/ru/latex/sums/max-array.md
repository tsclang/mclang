# \max_{x \in v} — максимум по массиву

---

## Синтаксис

```latex
\max_{x \in v} expr
```

---

## Трансляция

```mc
\max_{x \in v} x^2
```

```c
mc_num _acc = v[0];
for (int _i = 1; _i < v_len; _i++) {
    mc_num x = v[_i];
    if (pow(x, 2.0) > _acc) _acc = pow(x, 2.0);
}
```

---

## Примеры

```mc
// Максимум квадратов (L∞-норма в квадрате)
max_sq(v: num[]) = \max_{x \in v} x^2

// Наибольшее отклонение от среднего
max_dev(v: num[], mu) = \max_{x \in v} (x - mu)^2
```

---

## Смотри aussi

- [\min по массиву](min-array.md) · [\sum по массиву](sum-array.md)
- [max](../../functions/aggregators/max.md)
