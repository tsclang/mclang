# \sum_{i=a}^{b} — сумма по диапазону

---

## Синтаксис

```latex
\sum_{i=a}^{b} expr
∑(i=a, b) expr   // Unicode-форма (альтернатива)
```

---

## Трансляция

Разворачивается в `for`-цикл:

```mc
\sum_{i=0}^{n} i^2
```

```c
mc_num _sum = 0.0;
for (int i = 0; i <= (int)n; i++) _sum += pow((mc_num)i, 2.0);
return _sum;
```

---

## Примеры

```mc
// Сумма квадратов
sum_sq(n) = \sum_{i=1}^{n} i^2

// Полином
poly(x, coeffs: num[], n: int) = \sum_{i=0}^{n} coeffs[i] * x^i

// Гармонический ряд
harmonic(n) = \sum_{k=1}^{n} \frac{1}{k}
```

---

## Смотри aussi

- [\sum по массиву](sum-array.md) · [\prod](prod-range.md)
- [Функции: sum](../../functions/aggregators/sum.md)
