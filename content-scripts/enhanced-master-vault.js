const deckListSelector = '.kf-table__body'
const deckPageSelector = '.deck-details__deck'

// remove old buttons
const cleanupButtons = () => {
  document.querySelectorAll('.OpenMenuButton').forEach(el => {
    el.parentNode.removeChild(el)
  })
}


const createAccessButton = (deckId) => {
  let el = document.createElement('label')
  el.setAttribute('for', 'menu-opener')
  el.setAttribute('data-deck-id', deckId)
  el.addEventListener('click', loadDokData)
  el.classList.add('OpenMenuButton')
  el.textContent = '[Access]'

  return el
}

const modifyDeckList = () => {
  let decks = document.querySelectorAll('div.deck-list__deck-name > a')

  cleanupButtons()

  // inject "[Access]" buttons
  decks.forEach(el => {
    let deckId = el.getAttribute('href').split('/')[2]
    let accessMenuBtn = createAccessButton(deckId)
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
  let accessMenuBtn = createAccessButton(deckId)

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
        <h2>
          <a href="https://decksofkeyforge.com/decks/${deck.keyforgeId}"> ${deck.name}
              <br>
              ${deck.forSale ? '[For Sale]' : ''}${deck.forTrade ? '[For Trade]' : ''}${deck.forAuction ? '[For Auction]' : ''}
          </a>
        </h2>

        <section class="section-scores">
          <div class="scores-bar">
              <div style="width: ${Number(deck.sasRating) >= 100 ? 100 : Number(deck.sasRating)}%"></div>
          </div>
          <h3>
              <div class="section-score">${Number(deck.sasRating)}</div> SAS
          </h3>
          <table class="table-scores">
            <tr>
              <td class="score">${Number(deck.cardsRating)}</td>
              <td>Card Rating</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.synergyRating)}</td>
              <td>Synergy</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.antisynergyRating)}</td>
              <td>AntiSynergy</td>
            </tr>
          </table>
        </section>

        <section class="section-scores">
          <div class="scores-bar">
              <div style="width: ${Number(deck.aercScore) >= 100 ? 100 : Number(deck.aercScore)}%"></div>
          </div>
          <h3>
              <div class="section-score">${Number(deck.aercScore)}</div> AERC
          </h3>
          <table class="table-scores">
            <tr>
              <td class="score">${Number(deck.amberControl)}</td>
              <td>Aember Control</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.expectedAmber)}</td>
              <td>Expected Aember</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.artifactControl)}</td>
              <td>Artifact Control</td>
            </tr>
              <tr>
              <td class="score">${Number(deck.creatureControl)}</td>
              <td>Creature Control</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.deckManipulation)}</td>
              <td>Deck Manipulation</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.effectivePower) / 10}</td>
              <td>Creature Power</td>
            </tr>

            <tr>
              <td colspan="2"><hr></td>
            </tr>
            <tr>
              <td class="score">${Number(deck.creatureCount)}</td>
              <td>Creatures</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.actionCount)}</td>
              <td>Actions</td>
            </tr>
              <tr>
              <td class="score">${Number(deck.upgradeCount)}</td>
              <td>Upgrades</td>
            </tr>
            <tr>
              <td class="score">${Number(deck.artifactCount)}</td>
              <td>Artifacts</td>
            </tr>
          </table>
        </section>
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
    <span class="dok-credit">
      <a href="https://decksofkeyforge.com">
        <img class="dok-icon" src="${chrome.extension.getURL('img/dok-apple-touch-icon.png')}">
      </a>
    </span>
  </nav>
  <label for="menu-opener" class="MenuOverlay"></label>
</aside>
`)
document.body.appendChild(menu)