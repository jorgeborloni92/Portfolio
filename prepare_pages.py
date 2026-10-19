"""Prepare the generated portfolio for GitHub Pages project hosting."""
import os
import re
from pathlib import Path

root = Path(__file__).parent / "dist"
repository = os.environ.get("GITHUB_REPOSITORY", "jorgeborloni92/Portfolio")
owner, name = repository.split("/", 1)
base = "" if name.lower() == owner.lower() + ".github.io" else "/" + name
origin = "https://" + owner + ".github.io" + base
for path in root.rglob("*"):
    if path.suffix not in (".html", ".js", ".css"):
        continue
    content = path.read_text()
    content = content.replace("https://jorge-borloni-portfolio.jborloni.chatgpt.site", origin)
    content = re.sub(r"""(["'])/(?!/)(?!""" + re.escape(base.lstrip("/")) + r"""/)""", lambda m: m.group(1) + base + "/", content) if base else content
    path.write_text(content)
(root / ".nojekyll").touch()
print("Prepared public site:", origin + "/")
