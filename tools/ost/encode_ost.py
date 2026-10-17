#!/usr/bin/env python3
"""Turn the rendered WAVs (out/ost/wav, from tools/ost/render_ost.py) into a tagged soundtrack release.

- measures integrated loudness (EBU R128) with ffmpeg and turns each track down to -16 LUFS
  (tracks quieter than that are left alone rather than boosted, so nothing clips; no limiter)
- encodes MP3 320 kbps CBR (ID3v2.3) and FLAC 24-bit / 48 kHz, both with tags and the cover embedded
- writes out/ost/Triple A Sweeper OST (MP3 320).zip and ... (FLAC 24-bit).zip

Needs ffmpeg on PATH. Cover: out/ost/cover.jpg (tools/ost/make_cover.py) if present.
"""
import os, re, shutil, subprocess, sys, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OST = os.path.join(ROOT, 'out', 'ost')
WAV = os.path.join(OST, 'wav')
TARGET_LUFS = -16.0
ALBUM = 'Triple A Sweeper (Original Game Soundtrack)'
TRACKS = [  # theme, title
    ('title', 'Triple A Sweeper (Main Theme)'),
    ('game', 'Sector B-4'),
    ('desert', 'The Dune Sea'),
    ('club', 'Da Club'),
    ('arctic', 'Station Nord-7'),
    ('pathos', 'Pathos-4'),
    ('home', "Mom's Backyard"),
    ('win', 'Mission Complete'),
    ('credits', 'End Credits'),
]


def loudness(path):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    summary = r.stderr[r.stderr.rindex('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', summary).group(1))


def main():
    if not shutil.which('ffmpeg'):
        sys.exit('ffmpeg not found on PATH')
    tracks = [(n, m, t) for n, (m, t) in enumerate(TRACKS, 1) if os.path.exists(os.path.join(WAV, m + '.wav'))]
    if not tracks:
        sys.exit('no WAVs in out/ost/wav — run scripts/export_ost.sh (or tools/ost/render_ost.py) first')
    cover = os.path.join(OST, 'cover.jpg')
    has_cover = os.path.exists(cover)
    mp3_dir = os.path.join(OST, 'Triple A Sweeper OST (MP3 320)')
    flac_dir = os.path.join(OST, 'Triple A Sweeper OST (FLAC 24-bit)')
    for d in (mp3_dir, flac_dir):
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        if has_cover:
            shutil.copy(cover, os.path.join(d, 'cover.jpg'))
    for n, m, title in tracks:   # album track numbers stay fixed even when only some themes were rendered
        wav = os.path.join(WAV, m + '.wav')
        lufs = loudness(wav)
        gain = min(0.0, TARGET_LUFS - lufs)
        meta = []
        for k, v in [('title', title), ('artist', 'Claude'), ('album_artist', 'Claude'), ('composer', 'Claude'), ('album', ALBUM),
                     ('track', f'{n}/{len(TRACKS)}'), ('date', '2026'), ('genre', 'Soundtrack'),
                     ('comment', 'Synthesised in real time with the Web Audio API. No samples were harmed.')]:
            meta += ['-metadata', f'{k}={v}']
        base = f'{n:02d} - {title}'
        inputs = ['-i', wav] + (['-i', cover, '-map', '0:a', '-map', '1:v', '-disposition:v', 'attached_pic'] if has_cover else [])
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-af', f'volume={gain}dB', '-c:a', 'libmp3lame', '-b:a', '320k',
                        *(['-c:v', 'mjpeg', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)'] if has_cover else []),
                        '-id3v2_version', '3', *meta, os.path.join(mp3_dir, base + '.mp3')], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-af', f'volume={gain}dB', '-c:a', 'flac', '-sample_fmt', 's32',
                        '-bits_per_raw_sample', '24', '-compression_level', '8', *(['-c:v', 'copy'] if has_cover else []),
                        *meta, os.path.join(flac_dir, base + '.flac')], check=True)
        print(f'{base:40s} {lufs:6.1f} LUFS -> gain {gain:+.1f} dB')
    for d in (mp3_dir, flac_dir):
        z = d + '.zip'
        with zipfile.ZipFile(z, 'w', zipfile.ZIP_STORED) as zf:
            for f in sorted(os.listdir(d)):
                zf.write(os.path.join(d, f), os.path.join(os.path.basename(d), f))
        print(os.path.relpath(z, ROOT), f'{os.path.getsize(z) / 1e6:.0f} MB')


if __name__ == '__main__':
    main()
