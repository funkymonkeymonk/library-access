import '../img/icon-128.png'
import '../img/icon-34.png'
import {createMenu} from "./background/menu"
import {setUpPageStateMatcher} from "./background/install"

chrome.runtime.onInstalled.addListener(function() {
  createMenu()
  setUpPageStateMatcher()
})