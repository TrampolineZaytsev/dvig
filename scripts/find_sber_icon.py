import re
import zipfile
from pathlib import Path

ROOT = Path(r"E:\DVIG")
PPTX = ROOT / "present.pptx"

with zipfile.ZipFile(PPTX) as z:
    # map rels id -> media
    rels_all = {}
    for name in z.namelist():
        if name.endswith(".rels") and "slides/slide" in name:
            xml = z.read(name).decode("utf-8")
            for m in re.finditer(
                r'Id="([^"]+)".*?Target="../media/([^"]+)"', xml, re.DOTALL
            ):
                rels_all[(name, m.group(1))] = m.group(2)

    for name in sorted(z.namelist()):
        if not re.match(r"ppt/slides/slide\d+\.xml$", name):
            continue
        slide_xml = z.read(name).decode("utf-8")
        rels_name = name.replace("slides/", "slides/_rels/") + ".rels"
        rels_xml = z.read(rels_name).decode("utf-8")
        id_to_media = dict(
            re.findall(r'Id="(rId\d+)".*?Target="../media/([^"]+)"', rels_xml, re.DOTALL)
        )
        embeds = re.findall(r'r:embed="(rId\d+)"', slide_xml)
        if embeds:
            media = [id_to_media.get(e, "?") for e in embeds]
            print(name, media)
