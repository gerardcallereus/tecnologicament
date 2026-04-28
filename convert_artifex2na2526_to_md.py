#!/usr/bin/env python3
import os
import re
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

SOURCE_DIR = Path("artifex2na2526")
OUTPUT_DIR = Path("artifex2na2526-md")

BLOCK_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "blockquote", "pre"}


def clean_soup(soup: BeautifulSoup) -> BeautifulSoup:
    for tag in soup.find_all(["script", "style", "noscript", "iframe", "svg", "form", "input", "button", "header", "footer", "nav"]):
        tag.decompose()

    for tag in soup.find_all("a"):
        href = tag.get("href", "")
        if href.startswith("#h.") or href.startswith("#h.") or href.startswith("#"):
            tag.replace_with_children()

    for tag in soup.find_all(attrs={"aria-label": "Copy heading link"}):
        tag.decompose()

    return soup


def text_for_tag(tag, indent=0):
    if isinstance(tag, NavigableString):
        return str(tag)
    if not isinstance(tag, Tag):
        return ""
    name = tag.name.lower()
    if name in {"script", "style", "noscript", "iframe", "svg", "form", "input", "button"}:
        return ""
    if name == "img":
        src = tag.get("src") or tag.get("data-src") or tag.get("data-lazy-src") or ""
        alt = tag.get("alt", "")
        if not src:
            return ""
        return f"![{alt}]({src})\n\n"
    if name == "a":
        href = tag.get("href", "")
        inner = normalize_whitespace("".join(text_for_tag(child, indent) for child in tag.children))
        if not inner:
            return ""
        if href and not href.startswith("#"):
            return f"[{inner}]({href})"
        return inner
    if name == "br":
        return "\n"
    if name in {"h1", "h2", "h3", "h4", "h5", "h6"}:
        level = int(name[1])
        inner = normalize_whitespace("".join(text_for_tag(child, indent) for child in tag.children))
        if not inner:
            return ""
        return f"{'#' * level} {inner}\n\n"
    if name == "p":
        inner = normalize_whitespace("".join(text_for_tag(child, indent) for child in tag.children))
        if not inner:
            return ""
        return f"{inner}\n\n"
    if name == "li":
        parent = tag.parent
        if parent and parent.name == "ol":
            index = list(parent.find_all("li", recursive=False)).index(tag) + 1
            prefix = f"{index}. "
        else:
            prefix = "- "
        text = normalize_whitespace("".join(text_for_tag(child, indent + 1) for child in tag.children))
        text = text.replace("\n", " ").strip()
        if not text:
            return ""
        return f"{'  ' * indent}{prefix}{text}\n"
    if name in {"ul", "ol"}:
        items = []
        for child in tag.find_all("li", recursive=False):
            items.append(text_for_tag(child, indent))
        return "".join(items) + "\n"
    if name == "blockquote":
        inner = normalize_whitespace("".join(text_for_tag(child, indent) for child in tag.children))
        return f"> {inner}\n\n" if inner else ""
    if name == "pre":
        inner = tag.get_text().rstrip("\n")
        if not inner:
            return ""
        return "```\n" + inner + "\n```\n\n"
    if name in {"div", "span", "section", "article", "main", "body"}:
        parts = []
        for child in tag.children:
            part = text_for_tag(child, indent)
            if part:
                parts.append(part)
        return "".join(parts)
    return "".join(text_for_tag(child, indent) for child in tag.children)


def normalize_whitespace(text: str) -> str:
    text = re.sub(r"[\t\r\u00a0]+", " ", text)
    text = re.sub(r" *\n+ *", "\n", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def extract_markdown(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    soup = clean_soup(soup)
    ui_keywords = [
        "Search this site",
        "Embedded Files",
        "Report abuse",
        "This site uses cookies",
        "Got it",
        "Learn more",
        "Page details",
        "Page updated",
    ]
    sections = [section for section in soup.find_all("section") if section.get("id", "").startswith("h.")]
    filtered = []
    for section in sections:
        text = section.get_text(" ", strip=True)
        if not text:
            continue
        if any(keyword in text for keyword in ui_keywords):
            continue
        filtered.append(section)
    if filtered:
        md = "\n\n".join(text_for_tag(section) for section in filtered)
    else:
        main = soup.find("body") or soup
        md = text_for_tag(main)
    md = normalize_whitespace(md)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip() + "\n"


def detect_title(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    title_tag = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "title"})
    if title_tag:
        content = title_tag.get("content", "").strip()
        if content:
            return content
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    h1 = soup.find("h1")
    if h1:
        return normalize_whitespace(h1.get_text())
    return "Untitled"


def convert_file(src_path: Path, dst_path: Path):
    html = src_path.read_text(encoding="utf-8", errors="ignore")
    title = detect_title(html)
    md_body = extract_markdown(html)
    frontmatter = f"---\ntitle: {title}\n---\n\n"
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(frontmatter + md_body, encoding="utf-8")
    print(f"Converted: {src_path} -> {dst_path}")


def is_html_file(path: Path) -> bool:
    return path.suffix.lower() == ".html"


def main():
    if not SOURCE_DIR.exists():
        raise SystemExit(f"Source directory not found: {SOURCE_DIR}")
    OUTPUT_DIR.mkdir(exist_ok=True)
    for root, dirs, files in os.walk(SOURCE_DIR):
        root_path = Path(root)
        if any(part == "_" for part in root_path.parts):
            continue
        for filename in files:
            if not filename.lower().endswith(".html"):
                continue
            if filename.lower() == "post.html":
                continue
            src_path = root_path / filename
            rel = src_path.relative_to(SOURCE_DIR)
            dst_path = OUTPUT_DIR / rel.with_suffix(".md")
            convert_file(src_path, dst_path)
    print(f"Done. Markdown files created in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
