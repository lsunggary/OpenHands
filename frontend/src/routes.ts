import {
  type RouteConfig,
  layout,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_oh/route.tsx", [
    index("routes/_oh._index/route.tsx"),
    route("settings", "routes/settings.tsx"),
    route("conversations/:conversationId", "routes/_oh.app/route.tsx", [
      index("routes/_oh.app._index/route.tsx"),
      route("browser", "routes/_oh.app.browser.tsx"),
      route("jupyter", "routes/_oh.app.jupyter.tsx"),
      route("served", "routes/app.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
