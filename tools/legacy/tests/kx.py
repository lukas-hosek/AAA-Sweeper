import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':1280,'height':800});errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'test.html');await pg.wait_for_timeout(800)
        await pg.evaluate("window.__t.audio()")
        await pg.evaluate("(()=>{window.__k=0;window.__c=0;window.__t.start('story',5);return 0})()")
        await pg.wait_for_timeout(1500)
        await pg.mouse.click(640,400)
        # jump to final seconds
        await pg.evaluate("(()=>{const G=window.__t.G();G.clock=G.floodStart+G.floodTotal-12;G.nextKlax=0;return 0})()")
        await pg.wait_for_timeout(14000)
        r=await pg.evaluate("(()=>{const G=window.__t.G();return [G.theme.name,G.flooded,window.__t.mus()]})()")
        print(r,errs)
        await b.close()
asyncio.run(main())
