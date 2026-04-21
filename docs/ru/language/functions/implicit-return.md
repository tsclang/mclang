# Неявный return

В mclang нет ключевого слова `return`. Возвращаемое значение функции — последнее выражение в её теле.

---

## Однострочная функция

```mc
square(x) = x^2
```

Генерируемый Си-код:

```c
mc_num square(mc_num x) {
    return pow(x, 2.0);
}
```

---

## Многострочная функция

```mc
hypotenuse(a, b) =
    a2 = a^2
    b2 = b^2
    sqrt(a2 + b2)
```

Последняя строка (`sqrt(a2 + b2)`) — возвращаемое значение.

```c
mc_num hypotenuse(mc_num a, mc_num b) {
    mc_num a2 = pow(a, 2.0);
    mc_num b2 = pow(b, 2.0);
    return sqrt(a2 + b2);
}
```

---

## Условный return

В блоках `if/else` каждая ветка возвращает своё значение:

```mc
abs_value(x) =
    if (x >= 0) x
    else -x
```

```c
mc_num abs_value(mc_num x) {
    if ((x >= 0.0)) {
        return x;
    } else {
        return -x;
    }
}
```

---

## Guard-return (ранний выход)

`if` без `else` возвращает значение и завершает функцию:

```mc
safe_log(x) =
    if (x <= 0) nan
    ln(x)
```

```c
mc_num safe_log(mc_num x) {
    if ((x <= 0.0)) return NAN;
    return log(x);
}
```

---

## Guard через where

```mc
safe_sqrt(x) =
    sqrt(x)
    where
        x >= 0    // guard: нарушение → return NAN
```

```c
mc_num safe_sqrt(mc_num x) {
    if (!((x >= 0.0))) return NAN;
    return sqrt(x);
}
```

---

## Возврат массива

```mc
roots(a, b, c) =
    d = sqrt(b^2 - 4*a*c)
    [(-b + d) / (2*a), (-b - d) / (2*a)]
```

Генерируется статический буфер:

```c
mc_num* roots(mc_num a, mc_num b, mc_num c) {
    static mc_num _result[2];
    mc_num d = sqrt(pow(b, 2.0) - (4.0 * a * c));
    _result[0] = (-b + d) / (2.0 * a);
    _result[1] = (-b - d) / (2.0 * a);
    return _result;
}
```

---

## Ошибки

### Последнее выражение — оператор присваивания

```mc
f(x) =
    a = x + 1    // ← последнее — присваивание, не выражение
```

Компилятор не вернёт `a`. Правильно:

```mc
f(x) =
    a = x + 1
    a
```

---

## Смотри aussi

- [Многострочное тело](multiline.md)
- [Guards](../where/guards.md)
- [Множественный возврат](multi-return.md)
