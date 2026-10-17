import asyncio, glob, os
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
css=''
for fam,pat in [('Teko','teko'),('Chakra Petch','chakra-petch'),('Cinzel','cinzel'),('Audiowide','audiowide'),('Russo One','russo-one'),('Michroma','michroma')]:
    for f in glob.glob(D+f'fonts/fontsource-{pat}-*/package/files/{pat}-latin-*-normal.woff2'):
        w=f.split('-latin-')[1].split('-')[0]
        css+="@font-face{font-family:'%s';font-weight:%s;src:url('file://%s') format('woff2')}\n"%(fam,w,f)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1000,'height':1000})
        await pg.goto('file://'+D+'ost/render.html');await pg.add_style_tag(content=css);await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{window.__title();return 0})()");await pg.wait_for_timeout(3500)
        await pg.evaluate("(()=>{document.querySelectorAll('.ticker,.ti-build').forEach(e=>e.style.display='none');const p=document.querySelector('#press');p.textContent='ORIGINAL GAME SOUNDTRACK';p.style.animation='none';p.style.opacity='.85';return 0})()")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=D+'ost/cover_raw.png')
        await b.close()
asyncio.run(main())
