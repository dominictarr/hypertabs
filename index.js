var h = require('hyperscript')
var u = require('./lib/util'),
  each = u.each,
  isVisible = u.isVisible,
  setVisible = u.setVisible,
  setInvisible = u.setInvisible

var Tabs = require('./tabs')

module.exports = function (opts) {
  if (!opts) opts = {}

  var content = h('section.content')
  var tabs = Tabs(content, {
    onClickLink: opts.onClickLink,
    onClickClose: opts.onClickClose,
    onSelectHook: onSelectHook,
    onCloseHook: opts.onCloseHook
  })
  var d = h('div.Hypertabs', [
    h('nav', [
      opts.prepend,
      tabs,
      opts.append
    ]),
    content
  ])

  function onSelectHook () {
    var sel = []
    each(content.children, function (page, i) {
      if(isVisible(page))
        sel.push(i)
    })
    if(''+sel === ''+selection) return
    d.selected = selection = sel

    if(opts.onSelectHook) opts.onSelectHook(selection)
  }

  var selection = d.selected = []

  d.add = function (el, change, split) {
    var page = h('div.page', el)
    page.content = el

    if(!split) setInvisible(page)
    var index = content.children.length
    content.appendChild(page)
    if(change !== false && !split) d.select(index)

    return page
  }

  function find (name) {
    if(Number.isInteger(name)) return name

    for(var i = 0; i < content.children.length; i++)
      if(page(i).content.id == name) return i

    return -1
  }

  function page (index) {
    return content.children[index]
  }

  d.has = function (name) {
    return ~find(name)
  }

  // getPage
  d.get = function (name) {
    return page(find(name))
  }

  d.select = function (index, change, split) {
    if('string' === typeof index) index = find(index)

    var max = content.children.length - 1
    if(index > max) index = 0
    if(index < 0) index = max

    if(split)
      page(index).style.display = 'flex'
    else
      [].forEach.call(content.children, function (page, i) {
        i == index ? setVisible(page) : setInvisible(page)
      })
    onSelectHook()
  }

  d.selectRelative = function (n) {
    d.select(selection[0] + n)
  }

  d.remove = function (i) {
    if(Array.isArray(i)) return i.reverse().forEach(d.remove)
    var el = d.get(i)
    opts.onCloseHook && opts.onCloseHook(el.firstChild)
    if(el) content.removeChild(el)
  }

  d.fullscreen = function (full) {
    tabs.style.display = full ? 'none' : null
    return full
  }

  d.isFullscreen = function () {
    return tabs.style.display === 'none'
  }

  return d
}
