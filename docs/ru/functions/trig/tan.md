# tan — тангенс

---

## Сигнатура

```mc
tan(x: num) → num
tg(x: num) → num   // синоним (русская традиция)
```

---

## Пример

```mc
slope(angle) = tan(angle)
```

```c
mc_num slope(mc_num angle) { return tan(angle); }
```

---

## Особые значения

| x | tan(x) |
|---|--------|
| 0 | 0 |
| π/4 | 1 |
| π/2 | ±∞ (UB / очень большое число) |
| π | ≈ 0 |

---

## Применение

```mc
// Уклон дороги
grade(rise, run) = arctan(rise / run)°

// Высота по углу и расстоянию
height(dist, angle) = dist * tan(angle)
```

---

## Смотри aussi

- [arctan](arctan.md) · [cot](cot.md)
