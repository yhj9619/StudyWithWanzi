const fs = require('fs');

function buildLinkQueryScript(shouldClean) {
  return `<script>
(function () {
  var clean = ${shouldClean ? 'true' : 'false'};
  var stripRe = /\\[[^\\]]*\\]|［[^］]*］|【[^】]*】|〔[^〕]*〕|\\([^)]*\\)|（[^）]*）|<[^>]*>|〈[^〉]*〉|《[^》]*》/g;
  var splitRe = /[,;，、；/]/;
  var punctRe = /^[:\\-~·/\\s]+/;
  var fallbackRe = /[\\[［【〔(（<〈《]([^\\]］】〕)）>〉》]+)[\\]］】〕)）>〉》]/;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  function updateLinks() {
    each(document.querySelectorAll('.link-src'), function (src) {
      var copy = src.cloneNode(true);
      each(copy.querySelectorAll('.replay-button, audio, script, style'), function (el) { el.parentNode.removeChild(el); });
      each(copy.querySelectorAll('br, div, p, li'), function (el) { el.parentNode.insertBefore(document.createTextNode(' '), el); });
      var raw = copy.textContent.replace(/\\s+/g, ' ').trim();
      var q = raw;
      if (clean) {
        var stripped = raw.replace(stripRe, '').split(splitRe)[0].replace(punctRe, '').trim();
        if (!stripped) {
          var m = raw.match(fallbackRe);
          stripped = m ? m[1].trim() : raw;
        }
        q = stripped || raw;
      }
      var parent = src.parentNode;
      if (parent) {
        each(parent.querySelectorAll('.link-btn[data-base]'), function (a) {
          a.setAttribute('href', a.getAttribute('data-base') + encodeURIComponent(q));
        });
      }
    });
  }
  updateLinks();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLinks);
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('.link-btn[data-base]') : null;
    if (a) { updateLinks(); }
  }, true);
})();
</script>`;
}

// Minimal DOM simulation
class MockNode {
  constructor(tag, text = '') {
    this.tagName = tag;
    this.textContent = text;
    this.children = [];
    this.attributes = {};
    this.parentNode = null;
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
  }
  querySelectorAll(sel) {
    let res = [];
    for (let c of this.children) {
      if (c.matches && c.matches(sel)) res.push(c);
      if (c.querySelectorAll) res = res.concat(c.querySelectorAll(sel));
    }
    return res;
  }
  matches(sel) {
    if (sel.startsWith('.')) {
      const cls = (this.attributes['class'] || '').split(' ');
      return cls.includes(sel.slice(1).split('[')[0]);
    }
    return false;
  }
  cloneNode(deep) {
    const copy = new MockNode(this.tagName, this.textContent);
    copy.attributes = { ...this.attributes };
    if (deep) {
      for (let c of this.children) copy.appendChild(c.cloneNode(true));
    }
    return copy;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
  }
  insertBefore(newNode, refNode) {
    const idx = this.children.indexOf(refNode);
    if (idx !== -1) this.children.splice(idx, 0, newNode);
  }
}

const doc = new MockNode('DOCUMENT');
const container = new MockNode('DIV');
container.attributes['class'] = 'field-item f-field-1';
const linkSrc = new MockNode('SPAN', '[명사]저서생물');
linkSrc.attributes['class'] = 'link-src';
const iconSpan = new MockNode('SPAN');
iconSpan.attributes['class'] = 'field-icons';
const wikiBtn = new MockNode('A');
wikiBtn.attributes['class'] = 'link-btn wiki-btn';
wikiBtn.attributes['data-base'] = 'https://ko.wikipedia.org/w/index.php?search=';
wikiBtn.attributes['href'] = 'https://ko.wikipedia.org/w/index.php?search=[명사]저서생물';
const dictBtn = new MockNode('A');
dictBtn.attributes['class'] = 'link-btn subdict-btn';
dictBtn.attributes['data-base'] = 'https://ko.dict.naver.com/#/search?query=';
dictBtn.attributes['href'] = 'https://ko.dict.naver.com/#/search?query=[명사]저서생물';

iconSpan.appendChild(wikiBtn);
iconSpan.appendChild(dictBtn);
container.appendChild(linkSrc);
container.appendChild(iconSpan);
doc.appendChild(container);

// Evaluate script with simulated document
const s = buildLinkQueryScript(true);
const jsCode = s.replace(/<\/?script>/g, '');
const fn = new Function('document', jsCode);
fn({
  querySelectorAll: (sel) => doc.querySelectorAll(sel),
  createTextNode: (t) => new MockNode('#text', t),
  readyState: 'complete',
  addEventListener: () => {}
});

console.log('After script execution:');
console.log('wikiBtn href:', wikiBtn.getAttribute('href'));
console.log('dictBtn href:', dictBtn.getAttribute('href'));

if (wikiBtn.getAttribute('href') === 'https://ko.wikipedia.org/w/index.php?search=' + encodeURIComponent('저서생물') &&
    dictBtn.getAttribute('href') === 'https://ko.dict.naver.com/#/search?query=' + encodeURIComponent('저서생물')) {
  console.log('>>> TEST PASSED: [명사] successfully removed from both links! <<<');
} else {
  console.log('>>> TEST FAILED! <<<');
  process.exit(1);
}

