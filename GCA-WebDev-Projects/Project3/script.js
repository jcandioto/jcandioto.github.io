// List of RTL language codes
const rtlLangs = ['ar', 'he', 'fa', 'ur'];

// Function to check and apply RTL if needed
function applyRTLIfNeeded() {
  const html = document.documentElement;
  const lang = html.getAttribute('lang') || '';
  const isRTL = rtlLangs.some(code => lang.startsWith(code));

  // Swap Bootstrap CSS if needed
  const bootstrapLink = document.querySelector('link[href*="bootstrap"]');
  if (isRTL) {
    html.setAttribute('dir', 'rtl');
    if (bootstrapLink && !bootstrapLink.href.includes('.rtl')) {
      bootstrapLink.href = bootstrapLink.href.replace('bootstrap.min.css', 'bootstrap.rtl.min.css');
    }
  } else {
    html.setAttribute('dir', 'ltr');
    if (bootstrapLink && bootstrapLink.href.includes('.rtl')) {
      bootstrapLink.href = bootstrapLink.href.replace('bootstrap.rtl.min.css', 'bootstrap.min.css');
    }
  }
}

// Observe changes to the <html> lang attribute (Google Translate updates this)
const observer = new MutationObserver(applyRTLIfNeeded);
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

// Initial check on page load
applyRTLIfNeeded();