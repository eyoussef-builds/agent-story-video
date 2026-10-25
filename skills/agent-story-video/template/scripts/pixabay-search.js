// Pixabay music search for launch-style tracks WITHOUT Content ID (so YouTube won't claim the video).
// Pixabay blocks scripted requests from outside a browser, so this runs in the built-in browser:
//   1. Open https://pixabay.com/music/ and paste this whole file into javascript_tool once.
//   2. Then call just `await __pxRun()` until it returns status "done" (each call works ~35 s; the tool
//      stops at 45 s). Progress is kept in localStorage, so a reload/closed pane only means pasting again.
// It goes slowly on purpose: bursts trigger Cloudflare's "Just a moment…" page. Start over: `__pxReset()`.
window.__pxQueries = ["inspiring corporate", "technology background", "uplifting corporate", "digital technology", "inspiring background", "success story", "motivational corporate", "innovation", "startup", "storytelling"];
window.__pxReset = () => localStorage.removeItem("__px");
window.__pxRun = async () => {
  const load = () => { try { return JSON.parse(localStorage.getItem("__px")); } catch { return null; } };
  const S = load() ?? { queries: window.__pxQueries.slice(), pages: [], seen: [], tracks: [], blocked: 0 };
  const save = () => localStorage.setItem("__px", JSON.stringify(S));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const get = async (u) => {
    const r = await fetch(u, { credentials: "include" });
    const h = await r.text();
    if (r.status === 403 || r.status === 429 || h.includes("Just a moment")) throw new Error("blocked");
    return h;
  };
  const parse = (u, h) => {
    const num = (label) => { const m = h.match(new RegExp(label + '</span><span class="">([\\d,]+)</span>')); return m ? +m[1].replace(/,/g, "") : 0; };
    const d = h.match(/"duration":"PT(?:(\d+)M)?(?:(\d+)S)?"/) || [];
    return {
      page: "https://pixabay.com" + u,
      title: ((h.match(/<title>([^<|]+)/) || [])[1] || "").trim(),
      contentId: h.includes("Content ID Registered"),
      license: /Content License|license-summary|"license":/.test(h),
      downloads: num("Downloads"),
      secs: +(d[1] || 0) * 60 + +(d[2] || 0),
      genre: ((h.match(/"genre":\[([^\]]*)\]/) || [])[1] || "").replace(/"/g, ""),
      mp3: (h.match(/"contentUrl":"([^"]+)"/) || [])[1],
    };
  };
  const t0 = Date.now();
  while (Date.now() - t0 < 35000 && (S.queries.length || S.pages.length)) {
    try {
      if (S.queries.length) {
        const q = S.queries[0];
        for (const page of [1, 2]) {
          const h = await get(`/music/search/${encodeURIComponent(q)}/?pagi=${page}`);
          for (const m of h.matchAll(/href="(\/music\/[a-z0-9-]+-\d+\/)"/g)) if (!S.seen.includes(m[1])) { S.seen.push(m[1]); S.pages.push(m[1]); }
          await sleep(400);
        }
        S.queries.shift();
      } else {
        const u = S.pages[0];
        S.tracks.push(parse(u, await get(u)));
        S.pages.shift();
        await sleep(300);
      }
      save();
    } catch {
      S.blocked++;
      save();
      await sleep(4000); // back off; the item stays queued and is retried
    }
  }
  const done = !S.queries.length && !S.pages.length;
  const picks = S.tracks.filter((t) => !t.contentId && t.license && t.secs >= 55 && t.secs <= 240).sort((a, b) => b.downloads - a.downloads).slice(0, 12);
  return JSON.stringify(
    done
      ? { status: "done", checked: S.tracks.length, contentIdRegistered: S.tracks.filter((t) => t.contentId).length, candidates: picks }
      : { status: "in progress — call `await __pxRun()` again", queriesLeft: S.queries.length, pagesLeft: S.pages.length, checked: S.tracks.length, blockedRetries: S.blocked },
    null,
    1,
  );
};
await window.__pxRun();
