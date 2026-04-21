# Guards в блоке where

Строка в блоке `where` без `=` является guard-условием. Если условие нарушено, функция немедленно возвращает `NAN`.

---

## Синтаксис

```mc
f(x) =
    выражение
    where
        условие     // guard: если false → return NAN
```

---

## Пример

```mc
safe_sqrt(x) =
    sqrt(x)
    where
        x >= 0      // guard: x должен быть неотрицательным
```

Генерируемый Си-код:

```c
mc_num safe_sqrt(mc_num x) {
    if (!((x >= 0.0))) return NAN;
    return sqrt(x);
}
```

---

## Несколько guards

```mc
safe_log_base(x, base) =
    log(x) / log(base)
    where
        x > 0           // x должен быть положительным
        base > 0        // base должен быть положительным
        base != 1       // base не должен быть 1
```

Guards выполняются **в порядке объявления** — сверху вниз.

---

## Guards и переменные вместе

```mc
validated_ratio(a, b) =
    result
    where
        b != 0          // guard 1
        a >= 0          // guard 2
        result = a / b  // переменная
```

Порядок:
1. Выполняется guard `b != 0`
2. Выполняется guard `a >= 0`
3. Вычисляется `result = a / b`
4. Возвращается `result`

---

## Guards с переменными из where

Guard может ссылаться на переменные из того же блока `where`:

```mc
normalized(v: num[], i: int) =
    v[i] / n
    where
        n = norm(v)
        n > 0     // guard: вектор не нулевой
```

---

## Разница с if-guard в теле

Guard через `where`:

```mc
f(x) =
    sqrt(x)
    where x >= 0
```

Guard через `if` в теле:

```mc
f(x) =
    if (x < 0) nan
    sqrt(x)
```

Оба эквивалентны по поведению. `where`-вариант предпочтителен для предусловий, `if`-вариант — для условной логики.

---

## Ошибки

### Guard после переменной, от которой зависит

```mc
f(x) =
    result
    where
        result = sqrt(x)   // вычисляется до guard — если x < 0, sqrt(x) = nan
        x >= 0             // guard выполняется слишком поздно
```

**Исправление:** переставь guard выше:

```mc
f(x) =
    result
    where
        x >= 0             // сначала guard
        result = sqrt(x)   // потом вычисление
```

---

## Смотри также

- [Определения в where](definitions.md)
- [Порядок вычислений](order.md)
- [Неявный return](../functions/implicit-return.md)
