const deckListSelector = '.kf-table__body'
const deckPageSelector = '.deck-details__deck'

// remove old buttons
const cleanupButtons = () => {
  document.querySelectorAll('.OpenMenuButton').forEach(el => {
    el.parentNode.removeChild(el)
  })
}

const modifyDeckList = () => {
  let decks = document.querySelectorAll('div.deck-list__deck-name > a')

  cleanupButtons()

  // inject "[Access]" buttons
  decks.forEach(el => {
    let deckId = el.getAttribute('href').split('/')[2]

    let accessMenuBtn = document.createElement('label')
    accessMenuBtn.setAttribute('for', 'menu-opener')
    accessMenuBtn.setAttribute('data-deck-id', deckId)
    accessMenuBtn.addEventListener('click', loadDokData)
    accessMenuBtn.classList.add('OpenMenuButton')
    accessMenuBtn.textContent = '[Access]'

    el.parentElement.parentElement.insertBefore(accessMenuBtn, el.nextSibling)
  })
}

// watch for changes to the deck list
const deckListMutationObserver = () => {
  let targetNode = document.querySelector(deckListSelector)
  let observerOptions = {
    childList: true,
    attributes: false,
    subtree: false
  }

  let observer = new MutationObserver(modifyDeckList)
  observer.observe(targetNode, observerOptions)
}

// handle the deck details page
const deckPageLoad = () => {
  let deck = document.querySelector(deckPageSelector)
  if (!deck) {
    return
  }

  // inject "[Access]" button
  let deckId = document.location.href.split('/').pop()

  let accessMenuBtn = document.createElement('label')
  accessMenuBtn.setAttribute('for', 'menu-opener')
  accessMenuBtn.setAttribute('data-deck-id', deckId)
  accessMenuBtn.addEventListener('click', loadDokData)
  accessMenuBtn.classList.add('OpenMenuButton')
  accessMenuBtn.textContent = '[Access]'

  deck.appendChild(accessMenuBtn)
}

// request deck data from Decks Of Keyforge and populate menu
const loadDokData = (event) => {
  let el = event.target
  let deckId = el.dataset.deckId
  let menuOpener = document.querySelector('#menu-opener')

  // cleanup stale view
  let deckContainer = document.querySelector('#deck-container')
  deckContainer.innerHTML = ''

  // CORB requires us to make requests from the background page
  chrome.runtime.sendMessage({
    contentScriptQuery: 'loadDokData',
    deckId: deckId
  },
    deck => {
      // handle bad response
      if (!deck || Object.keys(deck).length === 0) {
        menuOpener.checked = false
        alert('Failed to load deck')
        return
      }

      let deckBody = document.createRange().createContextualFragment(`
        <a href="https://decksofkeyforge.com/decks/${deck.keyforgeId}">
          <h2>
            ${deck.name}
            <img src="${chrome.extension.getURL('dok-icon-16x16.png')}"><br>
            ${deck.forSale ? '[For Sale]' : ''}${deck.forTrade ? '[For Trade]' : ''}${deck.forAuction ? '[For Auction]' : ''}
          </h2>
        </a>
        <h3>${Number(deck.sasRating)} SAS</h4>
        <br>
        <p>${Number(deck.cardsRating)} Card Rating</p>
        <p>${Number(deck.synergyRating)} Synergy</p>
        <p>${Number(deck.antisynergyRating)} AntiSynergy</p>
        <hr>
        <h3>${Number(deck.aercScore)} AERC</h4>
        <br>
        <p>${Number(deck.amberControl)} Aember Control</p>
        <p>${Number(deck.expectedAmber)} Expected Aember</p>
        <p>${Number(deck.artifactControl)} Artifact Control</p>
        <p>${Number(deck.creatureControl)} Creature Control</p>
        <p>${Number(deck.deckManipulation)} Deck Manipulation</p>
        <p>${Number(deck.effectivePower) / 10} Creature Power</p>
        <!--
        <hr>
        <p>${Number(deck.rawAmber)} Bonus Aember</p>
        <p>${Number(deck.keyCheatCount)} Key Cheat</p>
        <p>${Number(deck.cardDrawCount)} Card Draw</p>
        <p>${Number(deck.cardArchiveCount)} Archive</p>
        -->
        <hr>
        <p>${Number(deck.creatureCount)} Creatures</p>
        <p>${Number(deck.actionCount)} Actions</p>
        <p>${Number(deck.upgradeCount)} Upgrades</p>
        <p>${Number(deck.artifactCount)} Artifacts</p>
      `)

      deckContainer.appendChild(deckBody)
    })
}

// wait for initial load so that we can then observe changes
document.arrive(deckListSelector, modifyDeckList)
document.arrive(deckListSelector, deckListMutationObserver)
document.arrive(deckPageSelector, deckPageLoad)

// handle navigating directly to a deck page
if (document.querySelector(deckPageSelector)) {
  deckPageLoad()
}

// create the hidden toggle for the menu
let menuCheck = document.createElement('input')
menuCheck.setAttribute('type', 'checkbox')
menuCheck.setAttribute('data-menu', 'DrawerMenu')
menuCheck.setAttribute('id', 'menu-opener')
menuCheck.setAttribute('hidden', '')

document.body.appendChild(menuCheck)

// create the drawer menu
let menu = document.createRange().createContextualFragment(`
<aside class="DrawerMenu">
  <nav class="Menu">
    <div id="deck-container"></div>
  </nav>
  <label for="menu-opener" class="MenuOverlay"></label>
</aside>
`)
document.body.appendChild(menu)