# Транслитерация Unicode в ASCII

При генерации Си-кода Unicode-идентификаторы транслитерируются в ASCII-совместимые имена.

---

## Таблица транслитерации

| mclang | Си |
|--------|----|
| `α` | `alpha` |
| `β` | `beta` |
| `γ` | `gamma` |
| `δ` | `delta` |
| `ε` | `epsilon` |
| `ζ` | `zeta` |
| `η` | `eta` |
| `θ` | `theta` |
| `ι` | `iota` |
| `κ` | `kappa` |
| `λ` | `lambda` |
| `μ` | `mu` |
| `ν` | `nu` |
| `ξ` | `xi` |
| `π` | `M_PI` (константа) |
| `ρ` | `rho` |
| `σ` | `sigma` |
| `τ` | `tau` |
| `υ` | `upsilon` |
| `φ` | `phi` |
| `χ` | `chi` |
| `ψ` | `psi` |
| `ω` | `omega` |
| `Γ` | `Gamma` |
| `Δ` | `Delta` |
| `Λ` | `Lambda` |
| `Σ` | `Sigma` |
| `Φ` | `Phi` |
| `Ψ` | `Psi` |
| `Ω` | `Omega` |

---

## Пример

```mc
lorentz_factor(β) =
    1 / sqrt(1 - β^2)
```

```c
mc_num lorentz_factor(mc_num beta) {
    return 1.0 / sqrt(1.0 - pow(beta, 2.0));
}
```

---

## Составные имена

Если имя состоит из нескольких Unicode-символов, каждый транслитерируется:

```mc
αβ_coeff(x) = x * 2
```

```c
mc_num alphabeta_coeff(mc_num x) { ... }
```

---

## Нижние индексы

Числа-нижние индексы (₀–₉) транслитерируются как `_0`–`_9`:

```mc
x₀ = 0.0
v₀ = 10.0
```

```c
mc_num x_0 = 0.0;
mc_num v_0 = 10.0;
```

---

## Коллизии транслитерации

Если `alpha` и `α` используются одновременно в одной функции — ошибка:

```mc
f(α, alpha) = α + alpha   // ошибка: оба транслитерируются в alpha
```

```
Error E015: name collision after transliteration: 'α' and 'alpha' both map to 'alpha'
```

---

## Смотри также

- [Unicode-идентификаторы](identifiers.md)
- [Нижние индексы](subscripts.md)
