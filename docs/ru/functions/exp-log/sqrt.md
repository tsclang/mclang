# sqrt — квадратный корень

---

## Сигнатура

```mc
sqrt(x: num) → num
\sqrt{x}          // LaTeX
```

---

## Пример

```mc
hyp(a, b) = sqrt(a^2 + b^2)
```

```c
mc_num hyp(mc_num a, mc_num b) { return sqrt(pow(a, 2.0) + pow(b, 2.0)); }
```

---

## Область

`x >= 0`. При `x < 0` → `nan`.

---

## Constant folding

`sqrt` с константой сворачивается при компиляции:

```mc
SQRT2 = sqrt(2)   // → 1.4142135623730951 в compile time
```

---

## Применение

```mc
// Расстояние между точками
distance(x1, y1, x2, y2) =
    sqrt((x2-x1)^2 + (y2-y1)^2)

// Среднеквадратичное отклонение
rms(v: num[]) = sqrt(mean(v .* v))
```

---

## Смотри aussi

- [sqrt-n](sqrt-n.md) · [Степень ^](../../operators/arithmetic/pow.md)
- [LaTeX: \sqrt](../../latex/arithmetic/sqrt.md)
