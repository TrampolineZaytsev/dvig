"""Build present.pptx + present.pdf (12 slides «Метамышь», CHTENIE.html C1)."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GEN = Path(__file__).resolve().parent / "gen_present_com.ps1"


def main() -> int:
    if not GEN.exists():
        print(f"Missing {GEN}", file=sys.stderr)
        return 1
    if GEN.suffix == ".ps1":
        return subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(GEN)],
            cwd=str(ROOT),
        ).returncode
    return subprocess.run([sys.executable, str(GEN)], cwd=str(ROOT)).returncode


if __name__ == "__main__":
    sys.exit(main())
