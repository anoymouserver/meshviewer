import { interpolate } from "d3-interpolate";

import { About } from "./about";
import { Container } from "./container";
import { DataDistributor } from "./datadistributor";
import { ForceGraph } from "./forcegraph";
import { Legend } from "./legend";
import { Linklist } from "./linklist";
import { Nodelist } from "./nodelist";
import { Map } from "./map";
import { Proportions } from "./proportions";
import { SimpleNodelist } from "./simplenodelist";
import { Sidebar } from "./sidebar";
import { Tabs } from "./tabs";
import { Title } from "./title";
import { Main as Infobox } from "./infobox/main";
import { FilterGui } from "./filters/filtergui";
import { HostnameFilter } from "./filters/hostname";
import * as helper from "./utils/helper";

export const Gui = function (language) {
  var self = this;
  var content;
  var contentDiv;

  var linkScale = interpolate(config.map.tqFrom, config.map.tqTo);
  var sidebar;

  var buttons = document.createElement("div");
  buttons.classList.add("buttons");

  var fanout = new DataDistributor();
  var fanoutUnfiltered = new DataDistributor();
  fanoutUnfiltered.add(fanout);

  function removeContent() {
    if (!content) {
      return;
    }

    router.removeTarget(content);
    fanout.remove(content);

    content.destroy();

    content = null;
  }

  function addContent(Content) {
    removeContent();

    content = new Content(linkScale, sidebar, buttons);
    content.render(contentDiv);

    fanout.add(content);
    router.addTarget(content);
  }

  function mkView(Content) {
    return function () {
      addContent(Content);
    };
  }

  var loader = document.getElementsByClassName("loader")[0];
  loader.classList.add("hide");

  contentDiv = document.createElement("div");
  contentDiv.classList.add("content");
  document.body.appendChild(contentDiv);

  sidebar = new Sidebar(document.body);

  contentDiv.appendChild(buttons);

  var buttonToggle = document.createElement("button");
  buttonToggle.classList.add("ion-eye");
  buttonToggle.setAttribute("aria-label", _.t("button.switchView"));
  buttonToggle.onclick = function onclick() {
    var data;
    if (content.constructor === Map) {
      data = { view: "graph", lat: undefined, lng: undefined, zoom: undefined };
    } else {
      data = { view: "map" };
    }
    router.fullUrl(data, false, true);
  };

  buttons.appendChild(buttonToggle);

  if (config.fullscreen || (config.fullscreenFrame && window.frameElement)) {
    var buttonFullscreen = document.createElement("button");
    buttonFullscreen.classList.add("ion-full-enter");
    buttonFullscreen.setAttribute("aria-label", _.t("button.fullscreen"));
    buttonFullscreen.onclick = function onclick() {
      helper.fullscreen(buttonFullscreen);
    };

    buttons.appendChild(buttonFullscreen);
  }

  var title = new Title();

  var header = new Container("header");
  var infobox = new Infobox(sidebar, linkScale);
  var tabs = new Tabs();
  var overview = new Container();
  var legend = new Legend(language);
  var newnodeslist = new SimpleNodelist("new", "firstseen", _.t("node.new"));
  var lostnodeslist = new SimpleNodelist("lost", "lastseen", _.t("node.missing"));
  var nodelist = new Nodelist();
  var linklist = new Linklist(linkScale);
  var statistics = new Proportions(fanout);
  var about = new About(config.devicePicturesSource, config.devicePicturesLicense);

  fanoutUnfiltered.add(legend);
  fanoutUnfiltered.add(newnodeslist);
  fanoutUnfiltered.add(lostnodeslist);
  fanoutUnfiltered.add(infobox);
  fanout.add(nodelist);
  fanout.add(linklist);
  fanout.add(statistics);

  sidebar.add(header);
  header.add(legend);

  overview.add(newnodeslist);
  overview.add(lostnodeslist);

  var filterGui = new FilterGui(fanout);
  fanout.watchFilters(filterGui);
  header.add(filterGui);

  var hostnameFilter = new HostnameFilter();
  fanout.addFilter(hostnameFilter);

  sidebar.add(tabs);
  tabs.add("sidebar.actual", overview);
  tabs.add("node.nodes", nodelist);
  tabs.add("node.links", linklist);
  tabs.add("sidebar.stats", statistics);
  tabs.add("sidebar.about", about);

  router.addTarget(title);
  router.addTarget(infobox);

  router.addView("map", mkView(Map));
  router.addView("graph", mkView(ForceGraph));

  self.setData = fanoutUnfiltered.setData;

  return self;
};
