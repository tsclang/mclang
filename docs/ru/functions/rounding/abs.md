# abs — модуль числа

---

## Сигнатура

```mc
abs(x: num) → num
|x|               // оператор-синоним
\abs{x}           // LaTeX
\|x\|             // LaTeX (двойные вертикальные черты)
```

---

## Пример

```mc
f(x) = abs(x)
g(x) = |x|        // эквивалентно
```

```c
mc_num f(mc_num x) { return fabs(x); }
```

---

## Особые значения

| x | abs(x) |
|---|--------|
| 3.5 | 3.5 |
| -3.5 | 3.5 |
| 0 | 0 |
| -inf | inf |
| nan | nan |

---

## Применение

```mc
// Расстояние на числовой оси
dist1d(a, b) = abs(a - b)

// Погрешность
error(measured, expected) = abs(measured - expected) / abs(expected)
```

---

## Смотри aussi

- [Оператор |x|](../../operators/special/abs.md)
- [sgn](sgn.md)
