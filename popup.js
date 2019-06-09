let masterVaultSection = document.getElementById('master-vault-section')
let libraryAccessBtn = document.getElementById('access-master-vault')
let libraryOnlyFavorites = document.getElementById('only-favorites')
let libraryText = document.getElementById('library-status')
let dokSection = document.getElementById('dok-section')
let syncDokBtn = document.getElementById('sync-dok')
let dokText = document.getElementById('dok-status')
let crucibleSection = document.getElementById('crucible-section')
let syncCrucibleBtn = document.getElementById('sync-crucible')
let crucibleText = document.getElementById('crucible-status')
let spinner = document.getElementById('spinner')

const handleMasterVaultToken = (cookie) => {
  if (!cookie) {
    alert('You must login to Master Vault first')
    spinner.classList.add('display-none')
    return
  }

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
  if (!token) {
    alert('You must login to Decks of KeyForge first')
    spinner.classList.add('display-none')
    return
  }

  if (!library || library.length == 0) {
    alert(
      'No decks accessed from Master Vault. Click "Access Master Vault" first.'
    )
    spinner.classList.add('display-none')
    return
  } else {
    library.forEach(deckId => {
      importDeckDok(token, deckId)
    })

    dokText.innerHTML = "Synced " + library.length + " decks"
    spinner.classList.add('display-none')
  }
})

const handleCrucibleToken = (token) => loadLibrary().then((library) => {
  if (!token) {
    alert('You must login to The Crucible Online first')
    spinner.classList.add('display-none')
    return
  }

  if (!library || library.length == 0) {
    alert(
      'No decks accessed from Master Vault. Click "Access Master Vault" first.'
    )
    spinner.classList.add('display-none')
    return
  } else {
    library.forEach(deckId => {
      importDeckCrucible(token, deckId)
    })

    crucibleText.innerHTML = "Synced " + library.length + " decks"
    spinner.classList.add('display-none')
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

const importDeckDok = (token, deckId) => new Promise((resolve, reject) => {
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

const importDeckCrucible = (token, deckId) => new Promise((resolve, reject) => {
  fetch("https://www.thecrucible.online/api/decks/", {
    "credentials": "include",
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9,da;q=0.8",
      "authorization": "Bearer " + token,
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "x-requested-with": "XMLHttpRequest",
    },
    "referrer": "https://www.thecrucible.online/decks/import",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": JSON.stringify({
      "uuid": deckId
    }),
    "method": "POST",
  }).then((response) => console.log('Import ' + deckId, response))
})

chrome.tabs.getSelected(null, (tab) => {
  tabUrl = tab.url;
  if (tabUrl.includes('www.keyforgegame.com')) {
    masterVaultSection.classList.remove('display-none')
    dokSection.classList.add('display-none')
    crucibleSection.classList.add('display-none')
  } else if (tabUrl.includes('decksofkeyforge.com')) {
    dokSection.classList.remove('display-none')
    masterVaultSection.classList.add('display-none')
    crucibleSection.classList.add('display-none')
  } else if (tabUrl.includes('www.thecrucible.online')) {
    crucibleSection.classList.remove('display-none')
    masterVaultSection.classList.add('display-none')
    dokSection.classList.add('display-none')
  }
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
        code: 'localStorage["AUTH"];'
      },
      (response) => {
        token = response[0]
        handleDokToken(token)
      }
    ))
}

syncCrucibleBtn.onclick = (el) => {
  spinner.classList.remove('display-none')
  chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) =>
    chrome.tabs.executeScript(
      tabs[0].id, {
        code: 'localStorage["refreshToken"];'
      },
      (response) => {
        token = response[0]
        fetch("https://www.thecrucible.online/api/account/token", {
            "credentials": "include",
            "headers": {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9,da;q=0.8",
              "cache-control": "no-cache",
              "content-type": "application/json",
              "pragma": "no-cache",
              "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://www.thecrucible.online/decks/import",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": JSON.stringify({
              'token': JSON.parse(token)
            }),
            "method": "POST",
            "mode": "cors"
          })
          .then((response) => response.json())
          .then((response) => {
            handleCrucibleToken(response.token)
          })
      }
    ))
}