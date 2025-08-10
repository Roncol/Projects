const saveBtn = document.getElementById('saveBtn');
const viewBtn = document.getElementById('viewBtn');
const deleteBtn = document.getElementById('deleteBtn');
const reloadBtn = document.getElementById('reloadBtn');
const statusEl = document.getElementById('status');
const listingsEl = document.getElementById('listings');
const detailsEl = document.getElementById('details');

let currentDetailsUrl = null;

function formatCurrency(value) {
  if (value === null || value === undefined) return '';
  const hasDecimals = Math.round(value * 100) % 100 !== 0;
  const options = {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  };
  return new Intl.NumberFormat('de-DE', options)
    .format(value)
    .replace(/\s/g, '');
}

function formatSize(value) {
  if (value === null || value === undefined) return '';
  return `${new Intl.NumberFormat('de-DE').format(value)} m²`;
}

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
  if (currentDetailsUrl === listing.url) {
    detailsEl.innerHTML = '';
    currentDetailsUrl = null;
    return;
  }
  const link = listing.url ? `<a href="${listing.url}" target="_blank">Zum Inserat</a><br>` : '';
  detailsEl.innerHTML = `
    <strong>${listing.name}</strong><br>
    Größe: ${formatSize(listing.size)}<br>
    Preis: ${formatCurrency(listing.price)}<br>
    Datum: ${listing.date ?? ''}<br>
    Adresse: ${listing.address ?? ''}<br>
    Preis pro m²: ${formatCurrency(listing.pricePerSqm)}<br>
    ${link}
  `;
  currentDetailsUrl = listing.url;
}

viewBtn.addEventListener('click', () => {
  chrome.storage.local.get({ listings: [] }, (result) => {
    const listings = result.listings.sort((a, b) => new Date(b.date) - new Date(a.date));
    listingsEl.innerHTML = '';
    detailsEl.innerHTML = '';
    if (listings.length === 0) {
      listingsEl.innerHTML = '<tr><td>Keine Inserate gespeichert.</td></tr>';
      return;
    }
    listings.forEach((listing) => {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = `${listing.name} - ${listing.date}`;
      tr.appendChild(td);
      tr.addEventListener('click', () => showDetails(listing));
      listingsEl.appendChild(tr);
    });
  });
});

deleteBtn.addEventListener('click', () => {
  chrome.storage.local.remove('listings', () => {
    statusEl.textContent = 'Alle Inserate gelöscht.';
    listingsEl.innerHTML = '';
    detailsEl.innerHTML = '';
  });
});

reloadBtn.addEventListener('click', () => {
  chrome.runtime.reload();
});
