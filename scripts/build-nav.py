#!/usr/bin/env python3
"""Rewrite the header, footer, stock-photo note and phone action bar on every page.

The site has no build step, so the same header and footer are repeated in each
page. Change the menu here, then run from the repo root:

    python3 scripts/build-nav.py

and commit the pages it changed.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
IG = "https://www.instagram.com/thelittleflowersblooms/"
TEL = "tel:+13378520857"
PHONE = "(337) 852-0857"
DM = "https://ig.me/m/thelittleflowersblooms"

# Main menu: (label, href, section key, sub-links)
MENU = [
    ("Weddings", "/weddings", "weddings", [("Plan your order", "/plan"), ("Flower styles", "/weddings#styles")]),
    ("Occasions", "/flowers", "occasions", [("Formals, graduations &amp; gifts", "/flowers#occasions"), ("Flower meanings", "/flowers#meanings")]),
    ("In season", "/seasons", "seasons", []),
    ("About", "/about", "about", []),
]

# Which menu section each page belongs to, and whether it gets the phone action bar
PAGES = {
    "index.html": ("home", True),
    "weddings/index.html": ("weddings", True),
    "plan/index.html": ("weddings", False),   # has its own running-total bar
    "flowers/index.html": ("occasions", True),
    "seasons/index.html": ("seasons", True),
    "about/index.html": ("about", True),
    "inquire/index.html": ("inquire", False),
    "credits/index.html": ("none", False),
    "404.html": ("none", False),
}

FOOTER_COLS = [
    ("Weddings", [("Wedding flowers", "/weddings"), ("Plan your order", "/plan"), ("Flower styles", "/weddings#styles")]),
    ("Occasions", [("Formals, graduations &amp; gifts", "/flowers"), ("Flower meanings", "/flowers#meanings"), ("In season", "/seasons")]),
    ("Say hello", [("Inquire", "/inquire"), ("Call or text " + PHONE, TEL), ("hello@thelittleflowersblooms.com", "mailto:hello@thelittleflowersblooms.com"), ("Instagram", IG), ("About Amélie", "/about")]),
]


def page_path(rel):
    return "/" if rel == "index.html" else "/" + rel.replace("/index.html", "")


def header(rel, section):
    here = page_path(rel)
    items = []
    for label, href, key, subs in MENU:
        cur = ' aria-current="page"' if href == here else ""
        cls = "nav-item" + (" has-sub" if subs else "") + (" is-current" if key == section else "")
        sub_html = ""
        if subs:
            sub_html = '\n          <ul class="nav-sub">' + "".join(
                f'\n            <li><a href="{h}"{" aria-current=\"page\"" if h == here else ""}>{l}</a></li>' for l, h in subs
            ) + "\n          </ul>"
        items.append(f'        <li class="{cls}">\n          <a href="{href}"{cur}>{label}</a>{sub_html}\n        </li>')
    inq_cur = ' aria-current="page"' if here == "/inquire" else ""
    return f'''<header class="site-header">
  <div class="header-inner">
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul class="nav-list">
{chr(10).join(items)}
      </ul>
      <div class="nav-extra">
        <a class="btn" href="/inquire"{inq_cur}>Inquire</a>
        <p>Wedding and event flowers in Lafayette, Louisiana<br><a href="{TEL}">{PHONE}</a><br><a href="{IG}">@thelittleflowersblooms</a></p>
      </div>
    </nav>
    <a class="brand" href="/">
      <span class="brand-name">The Little Flower's Blooms</span>
      <span class="brand-by">by Amélie</span>
    </a>
    <div class="header-actions">
      <a class="btn" href="/inquire"{inq_cur}>Inquire</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><b class="visually-hidden">Menu</b></button>
    </div>
  </div>
</header>'''


def footer():
    cols = []
    for title, links in FOOTER_COLS:
        lis = "".join(f'\n          <li><a href="{h}">{l}</a></li>' for l, h in links)
        cols.append(f'      <div>\n        <h2>{title}</h2>\n        <ul>{lis}\n        </ul>\n      </div>')
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <p class="footer-mark">The Little Flower's Blooms<em>by Amélie · Lafayette, Louisiana</em></p>
{chr(10).join(cols)}
    </div>
    <div class="footer-base">
      <p>© <span data-year>2026</span> The Little Flower's Blooms</p>
      <p>Wedding and event flowers in Lafayette, Louisiana</p>
      <p>Stock photos from Unsplash, except Instagram posts · <a href="/credits">Credits</a></p>
    </div>
  </div>
</footer>'''


def note(rel):
    cur = ' aria-current="page"' if rel == "credits/index.html" else ""
    return ('<p class="site-note"><span class="note-long">Site in progress: photos are Unsplash stock, not Amélie\'s work, except her Instagram posts.</span>'
            f'<span class="note-short">Stock photos for now, not Amélie\'s work.</span> <a href="/credits"{cur}>Photo credits</a></p>')

ACTION_BAR = f'''<div class="action-bar">
  <a class="btn" href="/inquire">Inquire</a>
  <a class="btn btn--line" href="{DM}">Message me</a>
</div>
'''


def build():
    for rel, (section, bar) in PAGES.items():
        path = ROOT / rel
        s = path.read_text()
        s, n1 = re.subn(r'<header class="site-header">.*?</header>', lambda m: header(rel, section), s, count=1, flags=re.S)
        s, n2 = re.subn(r'<footer class="site-footer">.*?</footer>', lambda m: footer(), s, count=1, flags=re.S)
        s, n3 = re.subn(r'<p class="site-note">.*?</p>', lambda m: note(rel), s, count=1, flags=re.S)
        assert n1 == n2 == n3 == 1, (rel, n1, n2, n3)
        s = re.sub(r'<div class="action-bar">.*?</div>\n', "", s, flags=re.S)
        s = re.sub(r'<body( class="[^"]*")?>', lambda m: m.group(0).replace(' class="has-action-bar"', "").replace("has-action-bar", "").replace(' class=""', ""), s, count=1)
        if bar:
            s = s.replace("<body>", '<body class="has-action-bar">', 1)
            s = s.replace("</footer>\n", "</footer>\n\n" + ACTION_BAR, 1)
        path.write_text(s)
        print(f"{rel}: section={section} action_bar={bar}")


if __name__ == "__main__":
    build()
