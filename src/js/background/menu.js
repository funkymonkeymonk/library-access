import dok from "../libs/dok"

export const createMenu = () => {
  const parent = chrome.contextMenus.create({
    "title": "Library Access",
    "documentUrlPatterns": ["*://www.keyforgegame.com/*"]
  })

  const dok = chrome.contextMenus.create({
    "parentId": parent,
    "title": "Decks Of Keyforge",
    "documentUrlPatterns": ["*://www.keyforgegame.com/*"]
  })

  const goDoK = chrome.contextMenus.create({
    "parentId": dok,
    "title": "Open",
    "documentUrlPatterns": ["*://www.keyforgegame.com/deck-details/*"],
    "onclick": dok.open
  })

  const mineDoK = chrome.contextMenus.create({
    "parentId": dok,
    "title": "Mark as yours",
    "documentUrlPatterns": ["*://www.keyforgegame.com/deck-details/*"],
    "onclick": dok.mine
  })

  const notMineDoK = chrome.contextMenus.create({
    "parentId": dok,
    "title": "Mark as not yours",
    "documentUrlPatterns": ["*://www.keyforgegame.com/deck-details/*"],
    "onclick": dok.notMine
  })

  const crucible = chrome.contextMenus.create({
    "parentId": parent,
    "title": "The Crucible",
    "documentUrlPatterns": ["*://www.keyforgegame.com/*"]
  })

  const addCrucible = chrome.contextMenus.create({
    "parentId": crucible,
    "title": "Add",
    "documentUrlPatterns": ["*://www.keyforgegame.com/deck-details/*"],
    "onclick": dok.open
  })

  const removeCrucible = chrome.contextMenus.create({
    "parentId": crucible,
    "title": "Remove",
    "documentUrlPatterns": ["*://www.keyforgegame.com/deck-details/*"],
    "onclick": dok.open
  })
}