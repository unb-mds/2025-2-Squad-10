import os
import requests

REPO = "unb-mds/2025-2-OncoMap"
OUTPUT_DIR = "content/sprints"
TOKEN = ""  # coloque aqui se for privado

os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

# Buscar milestones
url = f"https://api.github.com/repos/{REPO}/milestones?state=all"
milestones = requests.get(url, headers=headers).json()

for m in milestones:
    title = m["title"]
    number = m["number"]
    desc = m["description"] or ""
    due_on = m["due_on"] or "2025-12-31"
    filename = f"{OUTPUT_DIR}/sprint-{number}.md"

    # Buscar issues da milestone
    url_issues = f"https://api.github.com/repos/{REPO}/issues?milestone={number}&state=all"
    issues = requests.get(url_issues, headers=headers).json()

    with open(filename, "w", encoding="utf-8") as f:
        f.write("---\n")
        f.write(f"title: \"{title}\"\n")
        f.write(f"date: {due_on}\n")
        f.write("draft: false\n")
        f.write("---\n\n")
        f.write(f"## Descrição\n{desc}\n\n")
        f.write("## Issues\n")
        for issue in issues:
            f.write(f"- [#{issue['number']}](/issues/issue-{issue['number']}/) {issue['title']}\n")

print(f"{len(milestones)} sprints salvas em {OUTPUT_DIR}")
