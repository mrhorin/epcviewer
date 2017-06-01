import { TouchBar } from 'electron'

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

/*---------------------------------------
  タッチバーを操作するクラス
----------------------------------------*/
module.exports = class TouchBarManager {

  constructor() {
    this.items = []
  }

  addItem = (item) => {
    this.items.push(new TouchBarButton(item))
  }

  addSpacer = (size) => {
    this.items.push(new TouchBarSpacer({size: size}))
  }

  get touchBar() {
    return new TouchBar(this.items)
  }

}