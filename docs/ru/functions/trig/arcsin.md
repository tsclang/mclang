# arcsin — арксинус

---

## Сигнатура

```mc
arcsin(x: num) → num    // результат в радианах
asin(x: num) → num      // синоним
```

---

## Область определения и значений

- Область: `[-1, 1]`
- Значения: `[-π/2, π/2]`
- При `|x| > 1` → `nan`

---

## Пример

```mc
angle_from_sin(s) = arcsin(s)°   // в градусах
```

```c
mc_num angle_from_sin(mc_num s) { return asin(s) * (180.0 / M_PI); }
```

---

## Применение

```mc
// Угол падения по компоненте скорости
incidence(vy, v) = arcsin(vy / v)
```

---

## Смотри aussi

- [sin](sin.md) · [arccos](arccos.md) · [arctan](arctan.md)
