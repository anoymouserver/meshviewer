import * as helper from "../utils/helper";

export const GenericNodeFilter = function (name, key, value, f) {
  var negate = false;
  var refresh;

  var label = document.createElement("label");
  var strong = document.createElement("strong");
  label.textContent = name + ": ";
  label.appendChild(strong);

  function run(node) {
    var dictKey = helper.dictGet(node, key.slice(0));

    if (f) {
      dictKey = f(dictKey);
    }

    return dictKey === value ? !negate : negate;
  }

  function setRefresh(f) {
    refresh = f;
  }

  function draw(el) {
    if (negate) {
      el.classList.add("not");
    } else {
      el.classList.remove("not");
    }

    strong.textContent = value;
  }

  function render(el) {
    el.appendChild(label);
    draw(el);

    label.onclick = function onclick() {
      negate = !negate;

      draw(el);

      if (refresh) {
        refresh();
      }
    };
  }

  function getKey() {
    return value.concat(name);
  }

  return {
    run: run,
    setRefresh: setRefresh,
    render: render,
    getKey: getKey,
  };
};
