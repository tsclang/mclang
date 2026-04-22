# deg — градусы в радианы

---

## Сигнатура

```mc
deg(x: num) → num
\deg{x}            // LaTeX
```

---

## Описание

Преобразует угол из градусов в радианы.

```
deg(x) = x × (π / 180)
```

---

## Пример

```mc
f(x) = sin(deg(x))   // синус угла в градусах
```

```c
mc_num f(mc_num x) { return sin(((x) * (M_PI / 180.0))); }
```

---

## Применение

```mc
// Угол поворота камеры
rot_matrix(angle_deg: num) =
    cos(deg(angle_deg))

// Альтернатива: символ °
g(x) = sin(x°)   // x° эквивалентно deg(x)
```

---

## Смотри также

- [Оператор °](../../operators/special/degrees.md)
- [sin](../trig/sin.md)
