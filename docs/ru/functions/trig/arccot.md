# arccot — арккотангенс

---

## Сигнатура

```mc
arccot(x: num) → num
```

Реализован как `π/2 - arctan(x)`.

---

## Пример

```mc
f(x) = arccot(x)
```

```c
mc_num f(mc_num x) { return M_PI / 2.0 - atan(x); }
```

---

## Область и значения

- Область: ℝ
- Значения: `(0, π)`

---

## Смотри aussi

- [cot](cot.md) · [arctan](arctan.md)
