# Оператор + (сложение)

---

## Синтаксис

```mc
a + b
```

---

## Скаляры

```mc
f(x, y) = x + y
```

```c
mc_num f(mc_num x, mc_num y) { return x + y; }
```

---

## Векторы (поэлементно)

```mc
add_vec(a: num[], b: num[]) = a + b
```

```c
mc_num* add_vec(mc_num* a, int a_len, mc_num* b, int b_len) {
    static mc_num _r[/* a_len */];
    for (int i = 0; i < a_len; i++) _r[i] = a[i] + b[i];
    return _r;
}
```

Длины должны совпадать — проверки нет, UB при несовпадении.

---

## Многострочное выражение

```mc
total(a, b, c, d) =
    a + b +
    c + d
```

---

## Сложение с константой

```mc
shift(v: num[], delta) = v + delta   // скаляр + вектор → добавить delta к каждому элементу
```

---

## Ошибки

### Сложение матрицы и вектора

```mc
m: num[][]
v: num[]
r = m + v   // ошибка: несовместимые типы
```

---

## Смотри aussi

- [Вычитание](sub.md)
- [Неявное умножение](implicit-mul.md)
