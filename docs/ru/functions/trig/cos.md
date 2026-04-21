# cos — косинус

---

## Сигнатура

```mc
cos(x: num) → num
```

Аргумент в **радианах**.

---

## Пример

```mc
f(x) = cos(x)
f_deg(x) = cos(x°)
```

```c
mc_num f(mc_num x) { return cos(x); }
```

---

## Особые значения

| x | cos(x) |
|---|--------|
| 0 | 1 |
| π/3 | 0.5 |
| π/4 | √2/2 ≈ 0.7071 |
| π/2 | ≈ 0 |
| π | -1 |

---

## Применение

```mc
dot_angle(a: num[], b: num[], angle) =
    norm(a) * norm(b) * cos(angle)

// Горизонтальная составляющая скорости
vx(v0, angle) = v0 * cos(angle)
```

---

## Смотри aussi

- [sin](sin.md) · [arccos](arccos.md)
