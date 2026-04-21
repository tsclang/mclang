# \prod_{x \in v} — произведение по массиву

---

## Синтаксис

```latex
\prod_{x \in v} expr
```

---

## Трансляция

```mc
\prod_{x \in v} x
```

```c
mc_num _prod = 1.0;
for (int _i = 0; _i < v_len; _i++) {
    mc_num x = v[_i];
    _prod *= x;
}
```

---

## Примеры

```mc
product_of(v: num[]) = \prod_{x \in v} x
geomean(v: num[]) = (\prod_{x \in v} x)^(1/v.length)
```

---

## Смотри aussi

- [\prod по диапазону](prod-range.md) · [\sum по массиву](sum-array.md)
