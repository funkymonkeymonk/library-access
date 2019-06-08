let libraryAccessBtn = document.getElementById('access-master-vault')
let libraryOnlyFavorites = document.getElementById('only-favorites')
let syncDokBtn = document.getElementById('sync-dok')
let libraryText = document.getElementById('library-access')
let dokText = document.getElementById('dok-sync')
let spinner = document.getElementById('spinner')

const handleMasterVaultToken = (cookie) => {
  let token = cookie.value
  let onlyFavorites = libraryOnlyFavorites.checked ? 1 : 0

  getUser(token).then((user) => getLibrary(token, user, 1, onlyFavorites, []).then((library) => {
    let libraryMin = []
    library.forEach(deck => {
      libraryMin.push(deck.id)
    })

    chrome.storage.sync.set({
        library: libraryMin
      },
      () => {
        spinner.classList.add('display-none')

        libraryText.innerHTML =
          library.length + ' decks accessed from Master Vault'
      }
    )
  }))
}

const handleDokToken = (token) => loadLibrary().then((library) => {
  if (!library || library.length == 0) {
    alert(
      'No decks accessed from Master Vault. Click "Access Master Vault" first.'
    )
  } else {
    library.forEach(deckId => {
      importDeck(token, deckId)
    })

    spinner.classList.add('display-none')
    alert('Synced decks')
  }
})

const getUser = (token) => fetch('https://www.keyforgegame.com/api/users/self/', {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: 'Token ' + token,
      'x-authorization': 'Token ' + token
    }
  })
  .then((response) => response.json())
  .then((user) => user.data)

const loadLibrary = () => new Promise((resolve, reject) => {
  chrome.storage.sync.get(['library'], (result) => resolve(result.library))
})

const getLibrary = (token, user, page, onlyFavorites, library) => new Promise((resolve, reject) => {
  fetch(
      'https://www.keyforgegame.com/api/users/' +
      user.id +
      '/decks/?page=' +
      page +
      '&page_size=10&search=&power_level=0,11&chains=0,24&only_favorites=' +
      onlyFavorites +
      '&ordering=-date', {
        credentials: 'include',
        headers: {
          accept: 'application/json',
          'accept-language': 'en-us',
          authorization: 'Token ' + token,
          'x-authorization': 'Token ' + token
        },
        method: 'GET'
      }
    )
    .then((response) => response.json())
    .then((response) => {
      library = library.concat(response.data)

      if (library.length != response.count) {
        page = page + 1
        getLibrary(token, user, page, onlyFavorites, library)
          .then(resolve)
          .catch(reject)
      } else {
        resolve(library)
      }
    })
})

const importDeck = (token, deckId) => new Promise((resolve, reject) => {
  fetch(
    'https://decksofkeyforge.com/api/decks/' + deckId + '/import-and-add', {
      credentials: 'include',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,da;q=0.8',
        authorization: token,
        timezone: '-240'
      },
      method: 'POST'
    }
  ).then((response) => console.log('Import ' + deckId, response))
})

loadLibrary().then((library) => {
  if (!library || library.length == 0) {
    libraryText.innerHTML = 'No decks accessed from Master Vault'
  } else {
    libraryText.innerHTML = library.length + ' decks accessed from Master Vault'
  }
})

libraryAccessBtn.onclick = (el) => {
  spinner.classList.remove('display-none')
  chrome.cookies.get({
      url: 'https://www.keyforgegame.com/',
      name: 'auth'
    },
    handleMasterVaultToken
  )
}

syncDokBtn.onclick = (el) => {
  spinner.classList.remove('display-none')
  chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) =>
    chrome.tabs.executeScript(
      tabs[0].id, {
        code: `localStorage["AUTH"];`
      },
      (response) => {
        token = response[0]
        handleDokToken(token)
      }
    ))
}