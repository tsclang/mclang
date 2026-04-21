# coth — гиперболический котангенс

---

## Сигнатура

```mc
coth(x: num) → num
```

Реализован как `cosh(x) / sinh(x)` или `1 / tanh(x)`.

---

## Пример

```mc
f(x) = coth(x)
```

```c
mc_num f(mc_num x) { return cosh(x) / sinh(x); }
```

---

## Область

`x ≠ 0`. При `x = 0` → `±∞`.

---

## Смотри aussi

- [tanh](tanh.md) · [sinh](sinh.md)
