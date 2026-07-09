import re
import zipfile
from pathlib import Path

EMU = 914400
z = zipfile.ZipFile(Path(r"E:\DVIG\present.pptx"))

targets = {"image9.png", "image11.png", "image12.png", "image4.png", "image3.png"}

for slide_num in range(1, 13):
    name = f"ppt/slides/slide{slide_num}.xml"
    rels_name = f"ppt/slides/_rels/slide{slide_num}.xml.rels"
    xml = z.read(name).decode("utf-8")
    rels = z.read(rels_name).decode("utf-8")
    id_map = dict(re.findall(r'Id="(rId\d+)".*?Target="../media/([^"]+)"', rels, re.DOTALL))

    for m in re.finditer(
        r'<a:off x="(\d+)" y="(\d+)".*?<a:ext cx="(\d+)" cy="(\d+)".*?r:embed="(rId\d+)"',
        xml,
        re.DOTALL,
    ):
        x, y, cx, cy, rid = m.groups()
        media = id_map.get(rid, "?")
        if media in targets:
            print(
                f"slide {slide_num}: {media} "
                f"pos ({int(x)/EMU:.2f}, {int(y)/EMU:.2f})in "
                f"size ({int(cx)/EMU:.2f}x{int(cy)/EMU:.2f})in"
            )
