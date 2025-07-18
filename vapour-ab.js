/*
Shopify AB utilty function for easy ab testing from liquid code and managing them
*/
(function () {
  const AB_NAMESPACE = "__AB_TESTS__";
  const SESSION_KEY = "__AB_TRACKED__";

  // Initialize global AB test object
  window[AB_NAMESPACE] = window[AB_NAMESPACE] || {};
  const abStore = window[AB_NAMESPACE];

  // Initialize session tracker
  const alreadyTracked = JSON.parse(
    sessionStorage.getItem(SESSION_KEY) || "{}"
  );

  /**
   * Send to Mixpanel only once per session per test
   */
  function maybeTrackAB(testName, value) {
    if (alreadyTracked[testName]) return;

    if (typeof mixpanel !== "undefined") {
      console.log("[LOG] mix tracked",testName , value);
      mixpanel.track(testName, { variant: value });
    } else {
      console.warn("mixpanel not defined");
    }

    alreadyTracked[testName] = true;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(alreadyTracked));
  }

  /**
   * Set an AB test value
   */
  window.setABTest = function (testName, value) {
    const alreadySet = abStore[testName] === value;

    abStore[testName] = value;
    localStorage.setItem(AB_NAMESPACE, JSON.stringify(abStore));

    if (!alreadySet) maybeTrackAB(testName, value);

    // syncCartNote();
    syncCartAttributes();
  };

  /**
   * Get an AB test value
   */
  window.getABTest = function (testName) {
    return abStore[testName] ?? null;
  };

  /**
   * Sync to cart note
   */
  // function syncCartNote() {
  //   fetch('/cart.js')
  //     .then(res => res.json())
  //     .then(cart => {
  //       const existingNote = cart.note || '';
  //       const abString = '[AB] ' + JSON.stringify(abStore);

  //       let newNote = '';
  //       if (existingNote.includes('[AB]')) {
  //         newNote = existingNote.replace(/\[AB\].*$/, abString);
  //       } else {
  //         newNote = existingNote
  //           ? existingNote + '\n' + abString
  //           : abString;
  //       }

  //       return fetch('/cart/update.js', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ note: newNote }),
  //       });
  //     })
  //     .catch(console.error);
  // }
  /**
   * Sync cart attributes
   */
  function syncCartAttributes() {
    fetch("/cart.js")
      .then((res) => res.json())
      .then((cart) => {
        const existingAttributes = cart.attributes || {};
        const abKey = "[AB]";
        const abString = JSON.stringify(abStore);

        const updatedAttributes = {
          ...existingAttributes,
          [abKey]: abString,
        };

        return fetch("/cart/update.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attributes: updatedAttributes }),
        });
      })
      .catch(console.error);
  }

  /**
   * Load existing from localStorage and track if not tracked yet
   */
  try {
    const persisted = localStorage.getItem(AB_NAMESPACE);
    if (persisted) {
      const parsed = JSON.parse(persisted);
      Object.assign(abStore, parsed);

      // Track persisted values if not tracked this session
      for (const [key, val] of Object.entries(parsed)) {
        maybeTrackAB(key, val);
      }
    }
  } catch (e) {
    console.warn("Failed to parse AB tests from localStorage", e);
  }

  // Initial cart note sync
  // syncCartNote();
  syncCartAttributes();
})();
