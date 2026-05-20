# Schemat TOML

## Pola główne

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `schema_version` | string | - | tak | wersja schematu danych | `"mc2d-0.2"` |
| `units` | string | - | tak | układ jednostek, obsługiwane `SI` | `"SI"` |

## `[lattice]`

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `type` | string | - | tak | typ sieci: `square`, `rectangular`, `hexagonal`, `oblique`, `custom` | `"square"` |
| `a` | number | m | tak | pierwsza stała sieciowa | `400e-9` |
| `b` | number | m | tak | druga stała sieciowa | `400e-9` |
| `cell_angle_deg` | number | deg | tak | kąt między wektorami bazowymi | `90.0` |
| `cell_angle_rad` | number | rad | opcjonalne | ten sam kąt w radianach | `1.57079632679` |
| `rotation_deg` | number | deg | tak | obrót całej sieci | `0.0` |
| `rotation_rad` | number | rad | opcjonalne | obrót w radianach | `0.0` |
| `sx` | number | - | tak | współczynnik ściśnięcia w osi x | `1.0` |
| `sy` | number | - | tak | współczynnik ściśnięcia w osi y | `1.0` |
| `compression_frame` | string | - | tak | kolejność transformacji: `lattice` albo `lab` | `"lattice"` |
| `a1` | array[2] | m | opcjonalne | jawny pierwszy wektor sieciowy | `[400e-9, 0]` |
| `a2` | array[2] | m | opcjonalne | jawny drugi wektor sieciowy | `[0, 400e-9]` |

Dla `compression_frame = "lattice"` używana jest konwencja:

```text
a_i = R(theta) * S(sx, sy) * a_i_base
```

Dla `compression_frame = "lab"` ściskanie działa po obrocie:

```text
a_i = S(sx, sy) * R(theta) * a_i_base
```

## `[structure]`

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `thickness` | number | m | tak | grubość warstwy | `20e-9` |
| `host_material` | string | - | tak | materiał matrycy | `"Py"` |

### `[structure.filling]`

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `total_fil_frac` | number | - | opcjonalne | sumaryczny udział pola inkluzji w komórce | `0.1198` |
| `by_material.<name>` | number | - | opcjonalne | udział pola dla materiału | `by_material.void = 0.0707` |

## `[materials.<name>]`

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `Ms` | number | A/m | tak | magnetyzacja nasycenia | `8.0e5` |
| `Aex` | number | J/m | tak | stała wymiany | `13e-12` |
| `Lex` | number | m | tak | długość wymiany | `5.7e-9` |
| `alpha` | number | - | tak | tłumienie Gilberta | `0.01` |
| `Ku1` | number | J/m^3 | opcjonalne | stała anizotropii | `5.0e5` |
| `anis_axis` | array[3] | - | opcjonalne | kierunek osi anizotropii | `[0, 0, 1]` |
| `Dind` | number | J/m^2 | opcjonalne | indukowana DMI | `1.0e-3` |

## `[[inclusions]]`

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `id` | string | - | tak | identyfikator inkluzji | `"inc1"` |
| `material` | string | - | tak | materiał inkluzji | `"CoFeB"` |
| `shape` | string | - | tak | `circle`, `ellipse`, `rectangle`, `polygon` | `"circle"` |
| `center_frac` | array[2] | - | opcjonalne | położenie we współrzędnych frakcyjnych komórki | `[0.25, 0.25]` |
| `center` | array[2] | m | opcjonalne | położenie w metrach | `[100e-9, 100e-9]` |
| `fil_frac` | number | - | opcjonalne | udział pola inkluzji w polu komórki | `0.0491` |
| `priority` | number | - | tak | kolejność nadpisywania przy nakładaniu | `10` |
| `radius` | number | m | dla koła | promień | `50e-9` |
| `rx`, `ry` | number | m | dla elipsy | półosie | `60e-9` |
| `wx`, `wy` | number | m | dla prostokąta | rozmiary | `80e-9` |
| `rotation_deg` | number | deg | opcjonalne | obrót kształtu | `45.0` |
| `vertices` | array[array[2]] | m | dla polygonu | wierzchołki lokalne względem środka | `[[0,0], [1e-9,0], [0,1e-9]]` |

`center_frac` oznacza współrzędne w bazie `a1`, `a2`. `center` oznacza pozycję w układzie laboratoryjnym w metrach. Jeśli brakuje jednego z pól, aplikacja próbuje je wyliczyć z drugiego.

## `[physics]`

| Pole | Typ | Jednostka | Wymagane | Znaczenie | Przykład |
| --- | --- | --- | --- | --- | --- |
| `gamma` | number | rad/(s T) | tak | współczynnik żyromagnetyczny | `1.76085963023e11` |
| `mu0` | number | H/m | tak | przenikalność magnetyczna próżni | `1.25663706212e-6` |
| `H0` | number | T | tak | skalar pola zewnętrznego w teslach | `0.1` |
| `H0_dir` | array[3] | - | tak | kierunek pola | `[0, 0, 1]` |
| `m_eq` | array[3] | - | opcjonalne | bezwymiarowy kierunek magnetyzacji równowagowej | `[0, 0, 1]` |
| `demag` | string | - | tak | model pola demagnetyzującego | `"full"` |
| `equilibrium` | string | - | tak | sposób wyznaczenia równowagi | `"saturated"` |
