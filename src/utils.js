exports.ready = function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
};

exports.createCell = function createCell(content) {
  const cell = document.createElement('td');

  if (typeof content === 'string') {
    cell.innerHTML += content;
  } else {
    cell.appendChild(content);
  }

  return cell;
};

exports.addClass = function addClass(element, className) {
  const e = element;
  if (e.classList) {
    e.classList.add(className);
  } else {
    e.className += `${className}`;
  }
};

exports.removeClass = function removeClass(element, className) {
  const e = element;
  if (e.classList) {
    e.classList.remove(className);
  } else {
    e.className =
      e.className.replace(
        new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'),
        ' '
      );
  }
};

exports.hasClass = function hasClass(element, className) {
  const e = element;
  let has;
  if (e.classList) {
    has = e.classList.contains(className);
  } else {
    has = new RegExp(`(^| )${className}( |$)`, 'gi').test(e.className);
  }

  return has;
};

module.exports = exports;
