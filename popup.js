document.getElementById('saveBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: 'SAVE_LISTING' }, (response) => {
      const statusEl = document.getElementById('status');
      if (response && response.success) {
        statusEl.textContent = 'Inserat gespeichert.';
      } else {
        statusEl.textContent = 'Konnte keine Daten speichern.';
      }
    });
  });
});
