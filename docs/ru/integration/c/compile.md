# Компиляция: gcc, clang, линковка

---

## Базовая компиляция

```bash
mclang math.mc                  # генерирует math.c и math.h
gcc math.c main.c -lm -o demo   # компилирует
./demo
```

`-lm` обязателен — все математические функции в `libm`.

---

## Только объектный файл

```bash
gcc -c math.c -o math.o         # только компиляция
gcc math.o main.o -lm -o demo   # линковка
```

---

## Оптимизация

```bash
gcc math.c main.c -lm -O2 -o demo          # оптимизация
gcc math.c main.c -lm -O3 -march=native -o demo  # агрессивная
```

---

## Clang

```bash
clang math.c main.c -lm -o demo
```

---

## Shared library (`.so` / `.dll`)

```bash
# Linux / macOS:
mclang math.mc --target shared
gcc -shared -fPIC math.c -lm -o math.so

# Windows (MinGW):
gcc -shared math.c -lm -o math.dll
```

---

## WebAssembly (Emscripten)

```bash
mclang math.mc --target wasm
emcc math.c -o math.js \
  -s EXPORTED_FUNCTIONS='["_circle_area","_circle_perimeter"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -lm
```

---

## Флаги точности

```bash
# f32
mclang math.mc --precision f32
gcc math.c main.c -lm -o demo
# В math.h будет: typedef float mc_num;

# double (по умолчанию)
mclang math.mc --precision f64
```

---

## Смотри aussi

- [include](include.md) · [Передача массивов](arrays.md) · [Shared library](shared.md)
