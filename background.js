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