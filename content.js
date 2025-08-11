function getValue(val) {
  if (!val) return null;
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return getValue(val[0]);
    }
    if ('value' in val) {
      return val.value;
    }
    if ('amount' in val) {
      return val.amount;
    }
  }
  return val;
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  let str = getValue(value).toString().trim();
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts[parts.length - 1].length === 3) {
      str = str.replace(/\./g, '');
    }
  }
  str = str.replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function extractListing() {
  let data = {};
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLdScripts) {
    try {
      const parsed = JSON.parse(script.textContent);
      if (parsed && Array.isArray(parsed['@graph'])) {
        data = parsed['@graph'].find((item) => item['@type'] === 'RealEstateListing') || {};
      } else if (Array.isArray(parsed)) {
        data = parsed.find((item) => item['@type'] === 'RealEstateListing') || parsed[0] || {};
      } else if (parsed['@type'] === 'RealEstateListing') {
        data = parsed;
      }
      if (Object.keys(data).length) break;
    } catch (e) {
      // ignore parsing errors
    }
  }

  const name = data.name || data.headline || document.querySelector('h1')?.innerText.trim() || '';

  let size = parseNumber(data.floorSize || data.livingSpace);
  if (!size) {
    const sizeEl = document.querySelector('[class*="wohnflaeche"]');
    size = parseNumber(sizeEl?.textContent);
  }

  const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers || {};
  let price = parseNumber(offers.price);
  if (!price) {
    const priceEl = document.querySelector('.is24qa-kaufpreis-main, dd.is24qa-kaufpreis');
    price = parseNumber(priceEl?.textContent);
  }

  const date = data.datePublished || new Date().toISOString().split('T')[0];

  let address = '';
  if (data.address) {
    const addr = Array.isArray(data.address) ? data.address[0] : data.address;
    address = [addr.streetAddress, addr.postalCode, addr.addressLocality]
      .filter(Boolean)
      .join(', ');
  }

  const pricePerSqm = price && size ? Math.round((price / size) * 100) / 100 : null;

  const url = window.location.href;

  return { name, size, price, date, address, pricePerSqm, url };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_LISTING') {
    const listing = extractListing();
    if (!listing.name && !listing.price) {
      sendResponse({ success: false });
      return;
    }
    chrome.storage.local.get({ listings: [] }, (result) => {
      const listings = result.listings;
      const existingIndex = listings.findIndex(l => l.url === listing.url);
      let updated = false;
      if (existingIndex >= 0) {
        listings[existingIndex] = listing;
        updated = true;
      } else {
        listings.push(listing);
      }
      chrome.storage.local.set({ listings }, () => {
        sendResponse({ success: true, listing, updated });
      });
    });
    return true; // indicates async response
  }
  if (request.action === 'GET_LISTING') {
    const listing = extractListing();
    if (!listing.name && !listing.price) {
      sendResponse({ success: false });
      return;
    }
    sendResponse({ success: true, listing });
  }
});
