# sin — синус

---

## Сигнатура

```mc
sin(x: num) → num
```

Аргумент в **радианах**.

---

## Пример

```mc
f(x) = sin(x)
g(deg) = sin(deg°)   // через оператор °
```

```c
mc_num f(mc_num x)   { return sin(x); }
mc_num g(mc_num deg) { return sin(deg * (M_PI / 180.0)); }
```

---

## Синонимы

Нет (только `sin`).

---

## Особые значения

| x | sin(x) |
|---|--------|
| 0 | 0 |
| π/6 | 0.5 |
| π/4 | √2/2 ≈ 0.7071 |
| π/2 | 1 |
| π | ≈ 0 (погрешность float) |
| 3π/2 | -1 |

---

## Применение

```mc
// Круговое движение
x_pos(r, t, ω) = r * cos(ω * t)
y_pos(r, t, ω) = r * sin(ω * t)

// Проекция силы
F_vertical(F, angle) = F * sin(angle)
```

---

## Смотри aussi

- [cos](cos.md)
- [arcsin](arcsin.md)
- [Оператор °](../../operators/special/degrees.md)
