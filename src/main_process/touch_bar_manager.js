import { TouchBar } from 'electron'

const { TouchBarButton, TouchBarSpacer } = TouchBar

/*---------------------------------------
  タッチバーを操作するクラス
----------------------------------------*/
export default class TouchBarManager {

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