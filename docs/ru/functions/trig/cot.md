# cot — котангенс

---

## Сигнатура

```mc
cot(x: num) → num
ctg(x: num) → num   // синоним (русская традиция)
```

---

## Генерируемый C-код

```mc
f(x) = cot(x)
```

```c
mc_num f(mc_num x) { return (1.0/tan(x)); }
```

---

## Особые значения

| x | cot(x) |
|---|--------|
| π/4 | 1 |
| π/2 | ≈ 0 |
| 0 | ±∞ |

---

## Смотри aussi

- [tan](tan.md) · [arccot](arccot.md)
