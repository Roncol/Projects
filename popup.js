const saveBtn = document.getElementById('saveBtn');
const viewBtn = document.getElementById('viewBtn');
const statusEl = document.getElementById('status');
const listingsEl = document.getElementById('listings');
const detailsEl = document.getElementById('details');

saveBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: 'SAVE_LISTING' }, (response) => {
      if (response && response.success) {
        statusEl.textContent = response.updated ? 'Inserat aktualisiert.' : 'Inserat gespeichert.';
      } else {
        statusEl.textContent = 'Konnte keine Daten speichern.';
      }
    });
  });
});

function showDetails(listing) {
  const link = listing.url ? `<a href="${listing.url}" target="_blank">Zum Inserat</a><br>` : '';
  detailsEl.innerHTML = `
    <strong>${listing.name}</strong><br>
    Größe: ${listing.size ?? ''}<br>
    Preis: ${listing.price ?? ''}<br>
    Datum: ${listing.date ?? ''}<br>
    Adresse: ${listing.address ?? ''}<br>
    Preis pro m²: ${listing.pricePerSqm ?? ''}<br>
    ${link}
  `;
}

viewBtn.addEventListener('click', () => {
  chrome.storage.local.get({ listings: [] }, (result) => {
    const listings = result.listings.sort((a, b) => new Date(b.date) - new Date(a.date));
    listingsEl.innerHTML = '';
    detailsEl.innerHTML = '';
    if (listings.length === 0) {
      listingsEl.textContent = 'Keine Inserate gespeichert.';
      return;
    }
    listings.forEach((listing) => {
      const li = document.createElement('li');
      li.textContent = `${listing.name} - ${listing.date}`;
      li.addEventListener('click', () => showDetails(listing));
      listingsEl.appendChild(li);
    });
  });
});
