# arccos — арккосинус

---

## Сигнатура

```mc
arccos(x: num) → num
acos(x: num) → num   // синоним
```

Область: `[-1, 1]`, значения: `[0, π]`. При `|x| > 1` → `nan`.

---

## Пример

```mc
angle_between(a: num[], b: num[]) =
    arccos(dot(a, b) / (norm(a) * norm(b)))
```

---

## Смотри aussi

- [cos](cos.md) · [arcsin](arcsin.md)
