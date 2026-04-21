# Передача массивов из C

Функции с параметрами `num[]` получают два аргумента: указатель и длину.

---

## Сигнатура

```mc
// math.mc
mean(v: num[]) = sum(v) / v.length
```

Генерируется:

```c
// math.h
mc_num mean(mc_num* v, int v_len);
```

---

## Вызов из Си

```c
#include "math.h"

int main(void) {
    double data[] = {1.0, 2.0, 3.0, 4.0, 5.0};
    int n = sizeof(data) / sizeof(data[0]);
    double m = mean(data, n);
    printf("mean = %g\n", m);   // mean = 3
    return 0;
}
```

---

## Матрица (num[][])

```mc
// math.mc
trace(A: num[][]) = ...
```

Генерируется:

```c
mc_num trace(mc_num* A, int A_rows, int A_cols);
```

Матрица передаётся как линейный массив (row-major):

```c
double A[] = {
    1.0, 2.0, 3.0,   // строка 0
    4.0, 5.0, 6.0,   // строка 1
    7.0, 8.0, 9.0    // строка 2
};
double t = trace(A, 3, 3);
```

---

## Возврат массива

Функции, возвращающие `num[]`, возвращают `mc_num*` (статический буфер):

```c
mc_num* result = my_vec_func(data, n);
// result действителен до следующего вызова my_vec_func
double r0 = result[0];   // сохрани, если нужно
```

---

## Ошибки

### Неверная длина

```c
double data[] = {1.0, 2.0, 3.0};
mean(data, 10);   // UB: читает за пределами массива
```

---

## Смотри aussi

- [include](include.md) · [compile](compile.md)
- [Типы: num[]](../../language/types/arrays.md)
