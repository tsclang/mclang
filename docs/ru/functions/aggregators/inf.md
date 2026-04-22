# \inf и \sup — инфимум и супремум

---

## Сигнатура

```mc
\inf(v: num[]) → num    // инфимум (≡ min для конечных множеств)
\sup(v: num[]) → num    // супремум (≡ max для конечных множеств)
```

---

## Описание

Для конечных числовых массивов `\inf` эквивалентен `min`, а `\sup` — `max`.

---

## Пример

```mc
lo(v: num[]) = \inf(v)   // минимальный элемент
hi(v: num[]) = \sup(v)   // максимальный элемент
```

```c
mc_num lo(const mc_num* v, int v_len) { return mc_min_arr(v, v_len); }
mc_num hi(const mc_num* v, int v_len) { return mc_max_arr(v, v_len); }
```

---

## Смотри также

- [min](min.md) · [max](max.md)
