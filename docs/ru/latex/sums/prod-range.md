# \prod_{i=a}^{b} — произведение по диапазону

---

## Синтаксис

```latex
\prod_{i=a}^{b} expr
```

---

## Трансляция

```mc
\prod_{i=1}^{n} i
```

```c
mc_num _prod = 1.0;
for (int i = 1; i <= (int)n; i++) _prod *= (mc_num)i;
```

---

## Примеры

```mc
// Факториал через произведение
fact(n) = \prod_{i=1}^{n} i

// Произведение последовательности
falling(n, k) = \prod_{i=0}^{k-1} (n - i)
```

---

## Смотри aussi

- [\sum по диапазону](sum-range.md) · [\prod по массиву](prod-array.md)
