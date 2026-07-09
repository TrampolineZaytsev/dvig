"""Replace template corner logos (Sber/brand) with dvig-logo.png in present.pptx."""
from __future__ import annotations

import io
import shutil
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(r"E:\DVIG")
PPTX = ROOT / "present.pptx"
PDF = ROOT / "present.pdf"
LOGO = ROOT / "public" / "dvig-logo.png"
BACKUP = ROOT / "present.before-logo.pptx"

# Embedded images used as small corner / footer logos in the template
REPLACE_MEDIA = ("image3.png", "image4.png", "image11.png")


def resize_logo(size: tuple[int, int]) -> bytes:
    logo = Image.open(LOGO).convert("RGBA")
    # Fit inside box, keep aspect, transparent padding
    logo.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    ox = (size[0] - logo.width) // 2
    oy = (size[1] - logo.height) // 2
    canvas.paste(logo, (ox, oy), logo)
    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    return buf.getvalue()


def patch_pptx() -> None:
    if not LOGO.exists():
        raise FileNotFoundError(LOGO)
    shutil.copy2(PPTX, BACKUP)

    with zipfile.ZipFile(PPTX, "r") as zin:
        names = zin.namelist()
        out_buf = io.BytesIO()
        with zipfile.ZipFile(out_buf, "w", zipfile.ZIP_DEFLATED) as zout:
            for name in names:
                data = zin.read(name)
                base = Path(name).name
                if base in REPLACE_MEDIA and name.startswith("ppt/media/"):
                    im = Image.open(io.BytesIO(data))
                    data = resize_logo(im.size)
                    print(f"replaced {name} -> {im.size}")
                zout.writestr(name, data)
        out_buf.seek(0)
        PPTX.write_bytes(out_buf.read())
    print(f"saved {PPTX}")


def export_pdf_com() -> None:
    try:
        import win32com.client

        get_process = __import__("subprocess").run
        get_process(["powershell", "-Command", "Get-Process POWERPNT -EA SilentlyContinue | Stop-Process -Force"], check=False)
        import time

        time.sleep(2)
        pp = win32com.client.Dispatch("PowerPoint.Application")
        pp.Visible = 1
        pres = pp.Presentations.Open(str(PPTX.resolve()))
        time.sleep(1)
        pres.SaveAs(str(PDF.resolve()), 32)
        pres.Close()
        pp.Quit()
        print(f"saved {PDF}")
    except Exception as exc:
        print(f"PDF skip: {exc}")


def open_pptx() -> None:
    import os

    os.startfile(str(PPTX.resolve()))


if __name__ == "__main__":
    import os

    patch_pptx()
    if os.environ.get("DVIG_SKIP_PPT") != "1":
        export_pdf_com()
        open_pptx()
