// ---------- data you edit ----------
const ARTICLES = [
  {
    title: "Choosing loss functions for imbalanced segmentation masks",
    text: "Why plain cross entropy struggles on thin, rare classes like glacier boundaries, and how Dice, Tversky, and boundary losses each fix a different part of the problem.",
    href: "articles/loss-functions-segmentation.html"
  },
  {
    title: "ResUNet vs SegFormer, two ways to segment the same image",
    text: "A practical comparison of a convolutional encoder decoder against a transformer based segmentation head, using my own glacier mapping runs.",
    href: "articles/resunet-vs-segformer.html"
  },
  {
    title: "Why fusing weak signals beats one strong model",
    text: "Notes from building a document fraud pipeline: what voting across several imperfect checks gets right that a single classifier does not.",
    href: "articles/ensemble-fraud-detection.html"
  }
];

// Only these upstream projects are shown in Open source.
// Hackathon repos (e.g. HCLTech-Hackathon) and course repos (es335-24-fall-assignment-1) are excluded.
// To add a new upstream project, add "owner/repo" here.
const OSS_REPOS = [
  "ashita-ai/conduit",
  "marimo-team/marimo",
  "aphp/edsnlp",
  "Lightning-AI/litgpt",
  "zenml-io/zenml"
].map(r => r.toLowerCase());

// ---------- helper: textContent only, nothing injected as HTML ----------
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}

// ---------- mobile menu ----------
(function () {
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    })
  );
})();

// ---------- writing ----------
(function () {
  const grid = document.getElementById("writing-grid");
  if (!grid) return;
  ARTICLES.forEach(a => {
    const card = el("a", "article-card");
    card.href = a.href;
    card.append(el("div", "date", "Article"));
    card.append(el("h3", "", a.title));
    card.append(el("p", "", a.text));
    grid.append(card);
  });
})();

// ---------- open source, live from GitHub (static HTML stays if this fails) ----------
(async function loadOSS() {
  const list = document.querySelector("#opensource .oss-list");
  if (!list) return;

  const KEY = "oss-cache-v3";            // bumped so old unfiltered caches are dropped
  const TTL = 6 * 60 * 60 * 1000;        // 6 hours; the unauthenticated API allows ~60 requests/hour
  let items = null;

  try {
    const cached = JSON.parse(localStorage.getItem(KEY) || "null");
    if (cached && Date.now() - cached.t < TTL) items = cached.items;
  } catch (e) { /* storage unavailable */ }

  if (!items) {
    try {
      const q = encodeURIComponent("author:MukeshK17 is:pr is:merged -user:MukeshK17");
      const r = await fetch("https://api.github.com/search/issues?q=" + q + "&per_page=100&sort=updated");
      if (!r.ok) throw new Error("GitHub API " + r.status);
      items = (await r.json()).items || [];
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), items })); } catch (e) {}
    } catch (e) {
      return; // keep the static fallback
    }
  }

  // keep only the allowlisted upstream projects
  items = items.filter(it =>
    OSS_REPOS.includes(it.repository_url.split("/repos/")[1].toLowerCase())
  );
  if (!items.length) return;             // keep the static fallback

  const byRepo = {};
  items.forEach(it => {
    const repo = it.repository_url.split("/repos/")[1];
    (byRepo[repo] = byRepo[repo] || []).push(it);
  });

  list.replaceChildren();
  Object.entries(byRepo)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([repo, prs]) => {
      const row = el("div", "oss-item");
      row.append(el("span", "badge", "merged"));

      const body = el("div", "body");
      body.append(el("b", "", repo.split("/")[1] + " · " + prs.length + (prs.length > 1 ? " PRs" : " PR")));
      prs.slice(0, 3).forEach(pr => {
        const p = el("p");
        const a = el("a", "", pr.title);
        a.href = pr.html_url; a.target = "_blank"; a.rel = "noopener";
        p.append(a);
        body.append(p);
      });
      row.append(body);

      const more = el("a", "repo", "view →");
      more.href = "https://github.com/" + repo + "/pulls?q=is%3Apr+author%3AMukeshK17+is%3Amerged";
      more.target = "_blank"; more.rel = "noopener";
      row.append(more);

      list.append(row);
    });
})();