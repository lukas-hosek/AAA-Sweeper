import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':1440,'height':900});errs=[]
        pg.on('console',lambda m: errs.append(f'{m.type}: {m.text}') if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append(f'PAGEERROR: {e}'))
        await pg.goto('file://'+D+'test.html');await pg.wait_for_timeout(500)
        await pg.evaluate("window.__t.audio()")
        await pg.evaluate("window.__t.start('normal',5)");await pg.wait_for_timeout(1500)
        await pg.mouse.click(720,450);await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const G=window.__t.G();G.floodTotal=G.clock-G.floodStart+40;})()")
        await pg.mouse.move(600,520);await pg.wait_for_timeout(5000)
        print('music', await pg.evaluate("window.__t.mus()"), 'theme', await pg.evaluate("window.__t.G().theme.name"), 'ts', await pg.evaluate("window.__t.G().tileset"))
        await pg.screenshot(path=D+'shots/d_p1.png')
        await pg.evaluate("(()=>{const G=window.__t.G();G.floodTotal=G.clock-G.floodStart+2;})()")
        await pg.wait_for_timeout(7000)
        print('flooded', await pg.evaluate("window.__t.G().flooded"))
        await pg.screenshot(path=D+'shots/d_p2.png')
        await pg.evaluate("window.__t.start('normal',6)");await pg.wait_for_timeout(1500)
        print('ch6', await pg.evaluate("window.__t.G().theme.name"), await pg.evaluate("window.__t.mus()"), await pg.evaluate("document.querySelector('#game').className"))
        print('errors:',errs[:10]);await b.close()
asyncio.run(main())
