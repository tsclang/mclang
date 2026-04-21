# ln — натуральный логарифм

---

## Сигнатура

```mc
ln(x: num) → num
log(x: num) → num   // синоним (без основания = натуральный)
```

---

## Пример

```mc
f(x) = ln(x)
```

```c
mc_num f(mc_num x) { return log(x); }
```

---

## Область

`x > 0`. При `x <= 0` → `nan` или `-inf`.

---

## Особые значения

| x | ln(x) |
|---|-------|
| 1 | 0 |
| e | 1 |
| 0 | -∞ |
| -1 | nan |

---

## Применение

```mc
// Энтропия Шеннона
entropy(p: num[]) =
    -sum(p .* ln(p))

// pH
ph(h_conc) = -log(h_conc) / log(10)   // = -lg(h_conc)
```

---

## Смотри aussi

- [lg](lg.md) · [log-base](log-base.md) · [exp](exp.md)
