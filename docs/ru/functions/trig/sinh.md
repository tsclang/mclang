# sinh — гиперболический синус

---

## Сигнатура

```mc
sinh(x: num) → num
sh(x: num) → num   // синоним
```

```c
mc_num f(mc_num x) { return sinh(x); }
```

---

## Определение

`sinh(x) = (e^x - e^(-x)) / 2`

---

## Применение

```mc
// Цепная линия (catenary)
catenary(x, a) = a * cosh(x / a)
```

---

## Смотри aussi

- [cosh](cosh.md) · [tanh](tanh.md)
