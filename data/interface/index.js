var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "send": function (id, data) {
    if (id) {
      if (context !== "webapp") {
        chrome.runtime.sendMessage({
          "method": id,
          "data": data,
          "path": "interface-to-background"
        }); 
      }
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "port": background.port.name,
          "path": "interface-to-background"
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (var id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-interface") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config  = {
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "button": {
    "is": {
      "enabled": function () {
        var play = document.querySelector(".play");
        return !play.getAttribute("disabled");
      }
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          var current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "load": function () {
    var reload = document.getElementById("reload");
    var support = document.getElementById("support");
    var donation = document.getElementById("donation");
    /*  */
    reload.addEventListener("click", function () {
      document.location.reload();
    }, false);
    /*  */
    support.addEventListener("click", function () {
      var url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      var url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          var tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      var context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            if (document.location.search === "?popup") config.port.name = "popup";
            /*  */
            if (config.port.name === "popup") {
              document.body.style.width = "600px";
              document.body.style.height = "500px";
            }
            /*  */
            background.connect(chrome.runtime.connect({"name": config.port.name}));
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "app": {
    "stop": function () {
      document.location.reload();
    },
    "timer": {
      "timeout": null,
      "interval": 1000,
      set value (val) {config.storage.write("timer-value", val)},
      get value () {return config.storage.read("timer-value") !== undefined ? Number(config.storage.read("timer-value")) : 7}
    },
    "next": function () {
      var timer = document.querySelector(".timer");
      if (config.button.is.enabled()) {
        if (config.app.vision.test.metrics.index < config.app.vision.test.metrics.level.length) {
          timer.textContent = config.app.timer.value;
          /*  */
          config.app.action(config.app.vision.test.metrics.index);
          config.app.vision.test.metrics.index = config.app.vision.test.metrics.index + 1;
        } else config.app.pause();
      }
    },
    "previous": function () {
      var timer = document.querySelector(".timer");
      if (config.button.is.enabled()) {
        if (config.app.vision.test.metrics.index > 0) {
          timer.textContent = config.app.timer.value;
          /*  */
          config.app.action(config.app.vision.test.metrics.index);
          config.app.vision.test.metrics.index = config.app.vision.test.metrics.index - 1;
        } else config.app.pause();
      }
    },
    "pause": function () {
      var play = document.querySelector(".play");
      var next = document.querySelector(".next");
      var timer = document.querySelector(".timer");
      var previous = document.querySelector(".previous");
      /*  */
      timer.textContent = '!';
      play.removeAttribute("disabled");
      next.removeAttribute("disabled");
      previous.removeAttribute("disabled");
      window.clearTimeout(config.app.timer.timeout);
      window.clearInterval(config.app.timer.interval);
    },
    "action": function (i) {
      var test = document.querySelector(".test .image");
      var level = document.querySelector(".footer .level");
      var image = document.querySelector(".result .image");
      var answer = document.querySelector(".footer .answer");
      /*  */
      var index = Math.floor(Math.random() * config.app.vision.test.metrics.angle.length);
      var transform = "rotate(" + config.app.vision.test.metrics.angle[index] + "deg)";
      var current = config.app.vision.test.metrics.level[i];
      /*  */
      test.style.transform = transform;
      image.style.transform = transform;
      answer.textContent = config.app.vision.test.metrics.answer[i];
      level.textContent = '#' + (/^-?\d+$/.test(current) ? current : 1);
      test.style.backgroundSize = Number(config.app.vision.test.metrics.mm[i]) + "mm";
    },
    "start": function () {
      var play = document.querySelector(".play");
      var stop = document.querySelector(".stop");
      var next = document.querySelector(".next");
      var timer = document.querySelector(".timer");
      var pause = document.querySelector(".pause");
      var previous = document.querySelector(".previous");
      var timervalue = document.querySelector(".timer-value");
      /*  */
      stop.addEventListener("click", config.app.stop);
      next.addEventListener("click", config.app.next);
      pause.addEventListener("click", config.app.pause);
      previous.addEventListener("click", config.app.previous);
      play.addEventListener("click", function () {config.app.play(true)});
      /*  */
      document.addEventListener("keydown", function (e) {
        if (e.code === "ArrowRight") config.app.next();
        if (e.code === "ArrowLeft") config.app.previous();
      });
      /*  */
      timervalue.value = config.app.timer.value;
      timer.textContent = timervalue.value;
      timervalue.addEventListener("change", function (e) {
        config.app.timer.value = e.target.value < 2 ? 2 : e.target.value;
        timer.textContent = config.app.timer.value;
      });
    },
    "play": function (clear) {
      if (config.button.is.enabled()) {
        var play = document.querySelector(".play");
        var next = document.querySelector(".next");
        var timer = document.querySelector(".timer");
        var previous = document.querySelector(".previous");
        var image = document.querySelector(".result .image");
        var answer = document.querySelector(".footer .answer");
        /*  */
        timer.textContent = config.app.timer.value;
        window.clearInterval(config.app.timer.interval);
        if (clear) config.app.vision.test.metrics.index = 0;
        config.app.timer.interval = window.setInterval(function () {
          var current = Number(timer.textContent);
          var half = config.app.timer.value / 2 + 2;
          /*  */
          timer.textContent = current - 1;
          if (current < half) {
            image.style.opacity = 1;
            answer.style.opacity = 1;
          }
        }, 1000);
        /*  */
        config.app.next();
        image.style.opacity = 0;
        answer.style.opacity = 0;
        play.setAttribute("disabled", true);
        next.setAttribute("disabled", true);
        previous.setAttribute("disabled", true);
        /*  */
        window.clearTimeout(config.app.timer.timeout);
        config.app.timer.timeout = window.setTimeout(function () {
          play.removeAttribute("disabled");
          config.app.vision.test.metrics.index < config.app.vision.test.metrics.level.length ? config.app.play(false) : config.app.pause();
        }, config.app.timer.value * 1000);
      }
    },
    "vision": {
      "test": {
        "metrics": { // ref: provisu.ch/images/PDF/Echart_en.pdf
          "index": 0,
          "angle": [0, 90, -90, 180, -90, 90],
          "level": [
            1, 1, 1,
            2, 2, 2, 2,
            3, 3, 3, 3, 3,
            4, 4, 4, 4, 4,
            5, 5, 5, 5, 5,
            6, 6, 6, 6, 6,
            7, 7, 7, 7, 7,
            8, 8, 8, 8, 8,
            9, 9, 9, 9, 9,
            10, 10, 10, 10, 10
          ],
          "mm": [
            "23.5", "23.5", "23.5",
            "15.5", "15.5", "15.5", "15.5",
            "12.0", "12.0", "12.0", "12.0", "12.0",
            "09.0", "09.0", "09.0", "09.0", "09.0",
            "07.5", "07.5", "07.5", "07.5", "07.5",
            "06.0", "06.0", "06.0", "06.0", "06.0",
            "4.50", "4.50", "4.50", "4.50", "4.50",
            "3.50", "3.50", "3.50", "3.50", "3.50",
            "03.0", "03.0", "03.0", "03.0", "03.0",
            "02.0", "02.0", "02.0", "02.0", "02.0"
          ],
          "answer": [
            "20/200", "20/200", "20/200",
            "20/150", "20/150", "20/150", "20/150",
            "20/100", "20/100", "20/100", "20/100", "20/100",
            "20/80",  "20/80",  "20/80",  "20/80",  "20/80",
            "20/60",  "20/60",  "20/60",  "20/60",  "20/60",
            "20/50",  "20/50",  "20/50",  "20/50",  "20/50",
            "20/40",  "20/40",  "20/40",  "20/40",  "20/40",
            "20/30",  "20/30",  "20/30",  "20/30",  "20/30",
            "20/25",  "20/25",  "20/25",  "20/25",  "20/25",
            "20/20",  "20/20",  "20/20",  "20/20",  "20/20"
          ]
        }
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
