var cheerio = require('cheerio');
var decode = require('he').decode;
var plumb = require('plumb');

// "private" helper for ensuring html entities are properly escaped
function _escapeHtml (input) {
  return String(input)
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;');
 }

// "private" helper for list processing into plaintext
function _list (str, isOrdered) {
  if (!str) return str;

  var $ = cheerio.load(str);
  var listEl = isOrdered ? 'ol' : 'ul';

  $(listEl).each(function (i, el) {
    var $out = cheerio.load('<p></p>');
    var $el = $(el);

    $el.find('li').each(function (j, li) {
      var tick = isOrdered ? String(j + 1) + '.' : '-';

      $out('p').append(tick + ' ' + _escapeHtml($(li).text()) + '<br />');
    });

    // avoid excess spacing coming off last element
    // (we are wrapping with a <p> anyway)
    $out('br').last().remove();

    $el.replaceWith($out.html());
  });

  return $.html();
}

function stripStylesAndScripts(str) {
  var $ = cheerio.load(str);

  $('script').remove();
  $('style').remove();

  var regex = new RegExp('^https://www.google.com/url\\?q=');
  var links = $('a[href]').map(function(i, el) {
    i += 1;
    $(this).append('[' + i.toString() + ']');
    var href = $(this).attr('href').replace(regex, '');
    return '<br>' + i.toString() + '. ' + href;
  }).get().join('\n');

  $('body').append(links);

  return $.html();
}

function stringify(x) {
  if (x === null || x === undefined) {
    return '';
  };

  return String(x);
}

function collapseWhitespace (val) {
  var output = val.replace(/\s+/g, ' ');
  return output;
}

function linebreaks (str) {
  var output = str.replace(/<\/?\s?(p|br|hr)[^<]*>/gi, function (x, tag) {
    switch (tag.toLowerCase()) {
      case 'p':
      case 'hr':
        return '\n\n';
      case 'br':
        return '\n';
    }

    return x;
  });

  return output;
}

function listOrdered (str) {
  return _list(str, true);
}

function listUnordered (str) {
  return _list(str, false);
}

function stripCssConditionalComment (str) {
  return str.replace(/<!--\[if.*?<!\[endif\]-->/g, '');
}

function stripTags (str) {
  return str.replace(/<[^<]+>/g, '');
}

function trim (str) {
  return str.trim();
}


module.exports = plumb(
  stringify,
  stripStylesAndScripts,
  listOrdered,
  listUnordered,
  collapseWhitespace,
  linebreaks,
  stripCssConditionalComment,
  stripTags,
  decode,
  trim
);
