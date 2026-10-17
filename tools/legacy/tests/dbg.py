import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':900})
        errs=[]
        pg.on('console',lambda m: errs.append(f'{m.type}: {m.text}'))
        pg.on('pageerror',lambda e: errs.append(f'PAGEERROR: {e}'))
        await pg.goto('file:///tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/dbg.html')
        await pg.wait_for_timeout(500)
        await pg.click('#aaa-icon'); await pg.wait_for_timeout(400)
        await pg.evaluate("window.__start('normal')")
        for k in range(5):
            await pg.wait_for_timeout(700)
            print(await pg.evaluate("window.__dbg()"))
        await pg.mouse.click(720,450); await pg.wait_for_timeout(600)
        print(await pg.evaluate("window.__dbg()"))
        print(errs)
        await b.close()
asyncio.run(main())
