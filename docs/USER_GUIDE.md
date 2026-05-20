# Instrukcja użytkownika

## Otwarcie aplikacji

Po publikacji otwórz:

```text
https://mamica-amu.github.io/2D_MCs_edit/
```

Lokalnie uruchom `npm run dev` i otwórz adres pokazany przez Vite.

## Ładowanie TOML

Kliknij `Load TOML` i wybierz plik `.toml`. Aplikacja sparsuje dane, uzupełni pola możliwe do wyliczenia i odświeży formularze oraz wizualizację.

Jeśli parser wykryje błąd składni, komunikat pojawi się nad edytorem TOML.

## Edycja sieci

W panelu `Lattice` ustaw typ sieci, stałe `a`, `b`, kąt komórki, obrót, współczynniki `sx`, `sy` oraz `compression_frame`.

Wektory `a1` i `a2` są wyliczane automatycznie, chyba że typ sieci zostanie rozwinięty w przyszłości do trybu pełnego `custom`.

## Edycja materiałów

Panel `Materials` zawiera osobne sekcje dla materiałów. Można edytować `Ms`, `Aex`, `Lex`, `alpha`, `Ku1` i `Dind`.

## Dodawanie i edycja inkluzji

W panelu `Inclusions` wybierz inkluzję z listy albo dodaj koło, prostokąt lub polygon. Formularz pozwala zmienić id, materiał, kształt, położenie frakcyjne, rozmiary, obrót, `fil_frac` i `priority`.

## Przesuwanie inkluzji myszą

Kliknij inkluzję na wizualizacji SVG i przeciągnij ją. Aplikacja aktualizuje `center_frac`, `center` oraz eksportowany TOML.

## Walidacja

Panel `Walidacja` pokazuje błędy i ostrzeżenia. Błędy oznaczają dane niespójne fizycznie lub strukturalnie, np. brak materiału albo ujemne parametry.

## Zapisywanie TOML

Kliknij `Save TOML`, aby pobrać aktualny opis struktury jako `mc2d.toml`.

## Eksport SVG i PNG

Kliknij `Export SVG` albo `Export PNG`. SVG jest eksportem wektorowym bieżącego widoku. PNG jest rastrową kopią widoku.

## Przykłady

Menu `Load Example` ładuje przykładowe struktury:

- `Square: 2 inkluzje`,
- `Hexagonal antidot`.
