# Оператор ∉ (непринадлежность множеству)

---

## Синтаксис

```mc
x ∉ S
x \notin S   // LaTeX
x !in S      // словесный синоним
```

---

## Определение

`x ∉ S` эквивалентно `not (x ∈ S)`.

---

## Примеры

```mc
is_not_natural(x) = x ∉ ℕ
outside_unit(x)   = x ∉ [0, 1]
```

```c
mc_num is_not_natural(mc_num x) {
    return !((x >= 0.0) && (fmod(x, 1.0) == 0.0)) ? 1.0 : 0.0;
}
```

---

## В guard-условиях

```mc
f(x) =
    sqrt(x)
    where x ∉ (-inf, 0)   // guard: x не должен быть отрицательным
```

---

## Смотри aussi

- [Принадлежность ∈](set-in.md)
