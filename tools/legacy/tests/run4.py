import asyncio, random
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
        for f in (4,2,5):
            await pg.evaluate(f"window.__t.start('normal',{f})");await pg.wait_for_timeout(2200)
            await pg.mouse.click(720,450);await pg.wait_for_timeout(400)
            random.seed(f)
            for k in range(0):
                await pg.mouse.click(720+random.uniform(-120,120),450+random.uniform(-120,120));await pg.wait_for_timeout(200)
            await pg.mouse.move(600,520);await pg.wait_for_timeout(6000)
            print(f, 'music:', await pg.evaluate("window.__t.mus()"))
            await pg.screenshot(path=D+f'shots/d_ch{f}b.png')
        print('errors:',errs[:10]);await b.close()
asyncio.run(main())
