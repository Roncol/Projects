# ImmoScout24 Saver

Chrome-Erweiterung zum Speichern von Inseraten vom Immobilienportal ImmoScout24. Nach einem Klick auf den Button im Popup werden Name des Inserats, Wohnfläche, Preis, Datum sowie – falls vorhanden – die Adresse erfasst. Zusätzlich berechnet das Plugin den Preis pro Quadratmeter und speichert alle Daten in `chrome.storage.local`.

## Nutzung

1. Öffne `chrome://extensions/` in Chrome.
2. Aktiviere den Entwicklermodus.
3. Klicke auf **Entpackte Erweiterung laden** und wähle dieses Verzeichnis aus.
4. Öffne ein ImmoScout24-Inserat und klicke im Popup der Erweiterung auf **Inserat speichern**.

Die gespeicherten Daten sind unter dem Schlüssel `listings` in `chrome.storage.local` abgelegt.
