# Notatki developerskie

## Architektura

Aplikacja jest statycznym projektem Vite + React + TypeScript. Nie ma backendu, bazy danych ani usług zewnętrznych.

Główne katalogi:

- `src/components` - komponenty UI,
- `src/model` - typy, geometria, TOML i walidacja,
- `src/examples` - przykłady ładowane w aplikacji,
- `public/examples` - przykłady dostępne jako statyczne pliki,
- `docs` - dokumentacja.

## Przepływ danych

Źródłem prawdy jest stan `MC2D` w `App.tsx`. Formularze modyfikują stan, funkcja `recalc` przelicza geometrię, `fil_frac`, `center` i `center_frac`, a następnie edytor TOML dostaje nowy eksport tekstowy.

## Import i eksport TOML

`src/model/toml.ts` zawiera lekki parser TOML dopasowany do schematu MVP. Obsługuje:

- sekcje `[lattice]`, `[structure]`, `[materials.X]`, `[physics]`,
- tablice tabel `[[inclusions]]`,
- liczby naukowe,
- tablice liczb,
- klucze kropkowane, np. `by_material.void`.

Eksport jest stabilny i zachowuje czytelny porządek sekcji.

## Walidacja

`src/model/validation.ts` zwraca listę komunikatów `error` i `warning`. Błędy dotyczą niespójnych lub niefizycznych danych, ostrzeżenia wskazują potencjalne problemy, np. sumę `fil_frac > 1`.

## Geometria

`src/model/geometry.ts` zawiera:

- konwersję stopnie/radiany,
- obliczanie wektorów sieciowych,
- konwersje `center_frac <-> center`,
- pole komórki,
- pole inkluzji i `fil_frac`,
- normalizację danych po imporcie.

## Wizualizacja

`Visualization2D.tsx` rysuje SVG. Używa rzeczywistych jednostek SI w `viewBox`, a kształty są skalowane przez przeglądarkę. Przeciąganie inkluzji przelicza pozycję myszy z układu SVG na współrzędne frakcyjne.

## Deployment

Workflow `.github/workflows/deploy.yml` uruchamia:

```bash
npm ci
npm run test
npm run build
```

Następnie publikuje `dist` przez GitHub Pages.

## Dodanie nowego kształtu inkluzji

1. Rozszerz `ShapeType` i `Inclusion` w `types.ts`.
2. Dodaj pole powierzchni w `inclusionArea`.
3. Dodaj formularz w `InclusionsPanel`.
4. Dodaj rysowanie w `Visualization2D`.
5. Dodaj eksport/import w `toml.ts`, jeśli kształt wymaga nowych pól.

## Dodanie nowego pola materiałowego

1. Rozszerz `Material` w `types.ts`.
2. Dodaj pole do formularza `MaterialsPanel`.
3. Dodaj eksport w `materialToml`.
4. Dodaj reguły walidacji, jeśli pole ma ograniczenia fizyczne.

## Rozszerzenie do 3D lub multilayer

Najbezpieczniej dodać nowy model, np. `MC3D` albo `LayeredMC`, zamiast przeciążać `MC2D`. Obecny kod zakłada płaską komórkę, wektory `a1`, `a2` i pole powierzchni. Dla multilayer należy dodać listę warstw, grubości i osobne materiały/inkluzje per warstwa.
