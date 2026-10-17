import asyncio, sys
from playwright.async_api import async_playwright
OUT='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/shots/'
URL='file:///home/claude/tripple-a-sweeper.html'
async def session(p, w, h, tag, mobile=False):
    b = await p.chromium.launch(executable_path='/opt/google/chrome/chrome', args=['--autoplay-policy=no-user-gesture-required','--no-sandbox'])
    ctx = await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=1, has_touch=mobile, is_mobile=mobile)
    pg = await ctx.new_page(); errs=[]
    pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
    await pg.goto(URL); await pg.wait_for_timeout(800)
    if not mobile: await pg.screenshot(path=OUT+tag+'_1desktop.png')
    if mobile: await pg.tap('#aaa-icon')
    else: await pg.click('#aaa-icon')
    await pg.wait_for_timeout(2600)
    if not mobile: await pg.screenshot(path=OUT+tag+'_2launcher.png')
    await pg.wait_for_timeout(5600)
    if not mobile: await pg.screenshot(path=OUT+tag+'_3intro.png')
    await pg.keyboard.down('Space'); await pg.wait_for_timeout(1100); await pg.keyboard.up('Space')
    await pg.wait_for_timeout(2600)
    await pg.screenshot(path=OUT+tag+'_4title.png')
    await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500)
    await pg.click('[data-m=new]'); await pg.wait_for_timeout(400)
    await pg.click('[data-d=normal]'); await pg.wait_for_timeout(5200)
    box = await pg.evaluate("(()=>{const c=document.querySelector('#cv').getBoundingClientRect();return [c.width,c.height]})()")
    cx,cy = box[0]/2, box[1]*0.5
    if mobile: await pg.touchscreen.tap(cx,cy)
    else: await pg.mouse.click(cx,cy)
    await pg.wait_for_timeout(1200)
    import random
    random.seed(3)
    for k in range(10):
        x=cx+random.uniform(-150,150) if not mobile else cx+random.uniform(-150,150)
        y=cy+random.uniform(-150,150)
        if mobile: await pg.touchscreen.tap(x,y)
        else: await pg.mouse.click(x,y)
        await pg.wait_for_timeout(250)
    if not mobile:
        await pg.mouse.click(cx+60, cy-40, button='right')
        await pg.mouse.move(cx-120, cy+80)
    await pg.wait_for_timeout(5500)
    await pg.screenshot(path=OUT+tag+'_5game.png')
    if not mobile:
        await pg.keyboard.press('j'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=OUT+tag+'_6quests.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
    print(tag, 'errors:', errs[:20])
    await b.close()
async def main():
    async with async_playwright() as p:
        await session(p,1440,900,'d')
        await session(p,390,844,'m',mobile=True)
asyncio.run(main())
