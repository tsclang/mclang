# Runtime helpers ABI

mclang генерирует набор `static inline` вспомогательных функций в начале `.c`-файла. Эти функции реализуют операции над массивами и матрицами и удаляются компилятором C, если не используются (DCE — Dead Code Elimination).

---

## Арифметика массивов

### mc_add_arr / mc_sub_arr

```c
static inline mc_num* mc_add_arr(const mc_num* a, const mc_num* b, int n);
static inline mc_num* mc_sub_arr(const mc_num* a, const mc_num* b, int n);
```

Поэлементное сложение / вычитание массивов длиной `n`.

### mc_mul_arr

```c
static inline mc_num* mc_mul_arr(const mc_num* a, const mc_num* b, int n);
```

Поэлементное умножение (`.*` Hadamard).

### mc_scale

```c
static inline mc_num* mc_scale(const mc_num* a, mc_num s, int n);
```

Умножение каждого элемента на скаляр `s`.

---

## Инициализация матриц

### mc_zeros

```c
static inline mc_num* mc_zeros(mc_num* m, int rows, int cols);
```

Заполняет матрицу `m` нулями.

### mc_ones

```c
static inline mc_num* mc_ones(mc_num* m, int rows, int cols);
```

Заполняет матрицу `m` единицами.

### mc_identity

```c
static inline mc_num* mc_identity(mc_num* m, int n);
```

Создаёт единичную матрицу `n×n`: диагональ — `1.0`, остальное — `0.0`.

---

## Векторные операции

### mc_dot

```c
static inline mc_num mc_dot(const mc_num* a, const mc_num* b, int n);
```

Скалярное произведение.

### mc_cross3

```c
static inline mc_num* mc_cross3(const mc_num* a, const mc_num* b);
```

Векторное произведение 3D-векторов.

### mc_norm

```c
static inline mc_num mc_norm(const mc_num* v, int n);
```

Евклидова норма `sqrt(dot(v, v))`.

---

## Матричные операции

### mc_matmul

```c
static inline mc_num* mc_matmul(
    const mc_num* A, int A_rows, int A_cols,
    const mc_num* B, int B_rows, int B_cols);
```

Матричное умножение A×B.

---

## Числовые вспомогательные функции

### mc_sgn

```c
static inline mc_num mc_sgn(mc_num x);
```

Знак числа: `-1.0`, `0.0`, `1.0`.

### mc_gcd / mc_lcm

```c
static inline mc_num mc_gcd(mc_num a, mc_num b);
static inline mc_num mc_lcm(mc_num a, mc_num b);
```

НОД и НОК (через вещественную арифметику).

---

## Параметры численных методов

| Метод | Параметр | Значение |
|-------|----------|---------|
| Производная | шаг `h` | `1e-7` |
| Интеграл (Симпсон) | число шагов `N` | `1000` |
| Биссекция | число итераций | `100` |
| Биссекция | сдвиг границы | `1e-9` |
| Биссекция | масштаб | `1e15` |

---

## Конфликты имён

Все helper-функции генерируются с префиксом `mc_` и объявляются как `static inline` — они видны только в пределах текущей единицы трансляции. Однако если в твоём коде уже определены функции с теми же именами, возникнет конфликт при объединении в одну единицу трансляции.

Список зарезервированных имён:

```
mc_add_arr  mc_sub_arr  mc_mul_arr  mc_scale
mc_dot      mc_cross3   mc_norm
mc_matmul   mc_det      mc_inv      mc_transpose
mc_identity mc_zeros    mc_ones
mc_sgn      mc_gcd      mc_lcm      mc_binom    mc_factorial
mc_mean     mc_std      mc_sum      mc_product  mc_min      mc_max
```

Если конфликт возникает — переименуй свои функции или подключай сгенерированный `.c`-файл как отдельную единицу трансляции.

---

## Смотри также

- [Передача массивов из C](arrays.md)
- [Тип num\[\]](../../language/types/arrays.md)
- [Тип num\[\]\[\]](../../language/types/matrices.md)
