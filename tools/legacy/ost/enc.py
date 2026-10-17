import subprocess, os, re, shutil
O='Triple A Sweeper OST'
T=[('title','Triple A Sweeper (Main Theme)',-13.5),('game','Sector B-4',-12.5),('desert','The Dune Sea',-14.8),('club','Da Club',-9.6),('arctic','Station Nord-7',-16.7),
   ('pathos','Pathos-4',-13.9),('home',"Mom's Backyard",-13.9),('win','Mission Complete',-14.2),('credits','End Credits',-17.0)]
shutil.rmtree(O,ignore_errors=True);os.makedirs(O+'/MP3 320 kbps');os.makedirs(O+'/FLAC 24-bit 48 kHz');shutil.copy('cover.jpg',O+'/cover.jpg')
for n,(m,name,I) in enumerate(T,1):
    g=min(0.0,-16.0-I)
    meta=['-metadata',f'title={name}','-metadata','artist=Claude','-metadata','album_artist=Claude','-metadata','composer=Claude',
          '-metadata','album=Triple A Sweeper (Original Game Soundtrack)','-metadata',f'track={n}/{len(T)}','-metadata','date=2026',
          '-metadata','genre=Soundtrack','-metadata','comment=Synthesised in real time with the Web Audio API. No samples were harmed.']
    base=f'{n:02d} - {name}'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{m}.wav','-i','cover.jpg','-map','0:a','-map','1:v','-af',f'volume={g}dB',
        '-c:a','libmp3lame','-b:a','320k','-c:v','mjpeg','-id3v2_version','3','-disposition:v','attached_pic',
        '-metadata:s:v','title=Album cover','-metadata:s:v','comment=Cover (front)',*meta,f'{O}/MP3 320 kbps/{base}.mp3'],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{m}.wav','-i','cover.jpg','-map','0:a','-map','1:v','-af',f'volume={g}dB',
        '-c:a','flac','-sample_fmt','s32','-bits_per_raw_sample','24','-compression_level','8','-c:v','copy','-disposition:v','attached_pic',*meta,f'{O}/FLAC 24-bit 48 kHz/{base}.flac'],check=True)
    print(base, round(g,1),'dB', flush=True)
