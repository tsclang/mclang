# floor, ceil, round — округление

---

## Сигнатуры

```mc
floor(x: num) → num   // округление вниз (к -∞)
ceil(x: num) → num    // округление вверх (к +∞)
round(x: num) → num   // к ближайшему целому
```

---

## Примеры

```mc
f(x) = floor(x)
g(x) = ceil(x)
h(x) = round(x)
```

```c
mc_num f(mc_num x) { return floor(x); }
mc_num g(mc_num x) { return ceil(x); }
mc_num h(mc_num x) { return round(x); }
```

---

## Таблица значений

| x | floor | ceil | round |
|---|-------|------|-------|
| 2.3 | 2 | 3 | 2 |
| 2.7 | 2 | 3 | 3 |
| 2.5 | 2 | 3 | 3 |
| -2.3 | -3 | -2 | -2 |
| -2.7 | -3 | -2 | -3 |

---

## Применение

```mc
// Целочисленное деление
int_div(a, b) = floor(a / b)

// Количество страниц
pages(items, per_page) = ceil(items / per_page)

// Квантование
quantize(x, step) = round(x / step) * step
```

---

## Смотри aussi

- [abs](abs.md) · [fmod](fmod.md)
