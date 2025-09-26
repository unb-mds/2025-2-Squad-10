import os
import requests
from datetime import date

# Configurações
REPO = "unb-mds/2025-2-OncoMap"
BRANCH = "main"
FOLDER = "ATA DE REUNIÕES"
OUTPUT_DIR = "content/atas"
TOKEN = ""  # se precisar autenticação (para repositórios privados)

os.makedirs(OUTPUT_DIR, exist_ok=True)
headers = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

# 1️⃣ Listar arquivos na pasta via API
url = f"https://api.github.com/repos/{REPO}/contents/{FOLDER}?ref={BRANCH}"
response = requests.get(url, headers=headers)
files = response.json()

for f in files:
    if f["name"].endswith(".md"):
        filename = f["name"]
        download_url = f["download_url"]

        # 2️⃣ Baixar o conteúdo do arquivo
        content = requests.get(download_url, headers=headers).text

        # 3️⃣ Criar front matter
        sprint_name = filename.replace(".md", "")
        today = date.today().isoformat()
        front_matter = f"""---
title: "Ata {sprint_name}"
date: {today}
sprint: "{sprint_name}"
type: "ata"
---

"""

        # 4️⃣ Salvar no Hugo
        with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as out_file:
            out_file.write(front_matter + content)

print(f"✅ Todas as atas foram baixadas para {OUTPUT_DIR} com front matter!")
