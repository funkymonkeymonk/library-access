const DOK_URL = 'https://www.decksofkeyforge.com/'

const id = url => url.split('/').filter(function (el) { return !!el; }).pop()

const open = info => {
  const path = 'decks/' + id(info.pageUrl)
  chrome.tabs.create({ url: DOK_URL + path })
}

const mine = info => {
  // TODO: Add to mark as mine
  const path = 'decks/' + id(info.pageUrl)
  chrome.tabs.create({ url: DOK_URL + path })
}

const notMine = info => {
  // TODO: Add to mark as not mine
  const path = 'decks/' + id(info.pageUrl)
  chrome.tabs.create({ url: DOK_URL + path })
}

export default { open, mine, notMine }