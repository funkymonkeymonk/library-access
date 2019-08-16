const apiKey = ""
let library = []

chrome.runtime.onInstalled.addListener(() => chrome.declarativeContent.onPageChanged.removeRules(undefined, () => chrome.declarativeContent.onPageChanged.addRules([{
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'www.keyforgegame.com'
      }
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'decksofkeyforge.com'
      }
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'www.thecrucible.online'
      }
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'thecrucible.online'
      }
    })
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()]
}])))

// CORS requests must happen in a background page now...
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.popupQuery == 'saveLibrary') {
      library = request.library
      sendResponse(true)
    } else if (request.popupQuery == 'fetchLibrary') {
      sendResponse(library)
    }

    if (request.contentScriptQuery == 'loadDokData') {
      fetch('https://decksofkeyforge.com/public-api/v3/decks/' + request.deckId, {
          headers: {
            'Api-Key': apiKey
          },
          method: 'GET'
        })
        .then(response => response.json())
        .then(response => {
          let deck = response.deck

          if (Object.keys(deck).length === 0) {
            sendResponse(false)
            return
          }

          sendResponse(deck)
        })
        .catch(() => {
          sendResponse(false)
        })
    }

    return true
  });