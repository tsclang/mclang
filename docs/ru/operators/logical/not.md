# Оператор not (логическое НЕ)

---

## Синтаксис

```mc
not x
!x      // синоним
¬x      // Unicode
```

---

## Пример

```mc
is_nonzero(x) = not (x == 0)
is_nonzero2(x) = !(x == 0)
```

```c
mc_num is_nonzero(mc_num x) { return !((x == 0.0)) ? 1.0 : 0.0; }
```

---

## Отрицание условия

```mc
is_outside(x, lo, hi) = not (lo <= x <= hi)
```

---

## Приоритет

`not` имеет более высокий приоритет, чем `and`/`or`, но ниже арифметических операторов:

```mc
not x > 0 and y > 0   // → (not (x > 0)) and (y > 0)
```

---

## Смотри aussi

- [and](and.md)
- [or](or.md)
