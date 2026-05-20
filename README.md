# 2D MCs Edit

Graficzny edytor on-line do wizualizacji i edycji dwuwymiarowych kryształów magnonicznych zapisanych w formacie TOML.

Docelowy adres GitHub Pages:

```text
https://mamica-amu.github.io/2D_MCs_edit/
```

## Screenshot

Miejsce na screenshot: po pierwszym wdrożeniu można dodać zrzut ekranu z widokiem formularzy, edytora TOML i wizualizacji SVG.

## Instalacja

```bash
npm install
```

## Uruchomienie lokalne

```bash
npm run dev
```

## Testy

```bash
npm run test
```

## Budowanie

```bash
npm run build
```

## Deployment na GitHub Pages

Projekt zawiera workflow `.github/workflows/deploy.yml`, który buduje aplikację i publikuje katalog `dist`.

Dla repozytorium `2D_MCs_edit` konfiguracja Vite ma:

```ts
base: "/2D_MCs_edit/"
```

Jeśli repozytorium będzie miało inną nazwę, np. `mc2d-editor`, zmień `base` w `vite.config.ts` na `/mc2d-editor/`.

## Funkcje

- import lokalnego pliku TOML,
- edycja tekstowa TOML,
- stabilny eksport TOML,
- walidacja błędów i ostrzeżeń,
- edycja parametrów sieci, struktury, materiałów, fizyki i inkluzji,
- wizualizacja SVG komórki 1x1 lub powielenia 3x3,
- wybór i przeciąganie inkluzji,
- eksport widoku SVG i PNG,
- przykładowe struktury.

## Format TOML

Format opisuje sekcje `lattice`, `structure`, `materials`, `inclusions` i `physics`. Szczegóły są w [docs/TOML_SCHEMA.md](docs/TOML_SCHEMA.md).

## Dokumentacja

- [Instrukcja użytkownika](docs/USER_GUIDE.md)
- [Schemat TOML](docs/TOML_SCHEMA.md)
- [Notatki developerskie](docs/DEVELOPER_NOTES.md)
