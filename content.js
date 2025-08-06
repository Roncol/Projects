function parseNumber(value) {
  if (!value) return null;
  let str = value.toString().trim();
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
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const parsed = JSON.parse(jsonLd.textContent);
      data = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (e) {
      // ignore parsing errors
    }
  }

  const name = data.name || data.headline || document.querySelector('h1')?.innerText.trim() || '';

  let size = parseNumber(data.floorSize);
  if (!size) {
    const sizeEl = Array.from(document.querySelectorAll('span, dd'))
      .find(el => /\b(m²|qm)/i.test(el.textContent));
    size = parseNumber(sizeEl?.textContent);
  }

  const price = parseNumber(data?.offers?.price) ||
    parseNumber(Array.from(document.querySelectorAll('span, dd'))
      .find(el => /€/.test(el.textContent))?.textContent);

  const date = data.datePublished || new Date().toISOString().split('T')[0];

  let address = '';
  if (data.address) {
    const addr = data.address;
    address = [addr.streetAddress, addr.postalCode, addr.addressLocality]
      .filter(Boolean)
      .join(', ');
  }

  const pricePerSqm = price && size ? Math.round((price / size) * 100) / 100 : null;

  return { name, size, price, date, address, pricePerSqm };
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
      listings.push(listing);
      chrome.storage.local.set({ listings }, () => {
        sendResponse({ success: true, listing });
      });
    });
    return true; // indicates async response
  }
});
