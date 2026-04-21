# \times

---

## Синтаксис

```latex
a \times b
```

---

## Трансляция

```mc
a \times b   →   cross(a, b)   →   mc_cross3(a, b, out)
```

Только для 3D-векторов `num[]`.

---

## Примеры

```mc
n(a: num[], b: num[]) = a \times b
torque(r: num[], F: num[]) = r \times F
```

---

## Смотри aussi

- [cross](../../functions/vector/cross.md) · [Оператор ⨯](../../operators/special/cross.md)
