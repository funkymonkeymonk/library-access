const genericOnClick = (info) => {
  const dok = 'https://www.decksofkeyforge.com/'
  const path = 'decks/'
  const id = info.pageUrl.split('/').filter(function(el){ return !!el; }).pop()
  chrome.tabs.create({ url: dok + path + id })
}

export const createMenu = () => {
  const parent = chrome.contextMenus.create({
    "title": "Library Access",
    "documentUrlPatterns": ["*://www.keyforgegame.com/*"]
  })

  const gotodok = chrome.contextMenus.create({
    "parentId": parent,
    "title": "Open in Decks Of Keyforge",
    "documentUrlPatterns": ["*://www.keyforgegame.com/deck-details/*"],
    "onclick": genericOnClick
  })
}