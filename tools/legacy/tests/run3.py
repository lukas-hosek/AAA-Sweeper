import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
async def run(p,w,h,tag,mobile):
    b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if mobile else 1,has_touch=mobile,is_mobile=mobile)
    pg=await ctx.new_page();errs=[]
    pg.on('console',lambda m: errs.append(f'{m.type}: {m.text}') if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e: errs.append(f'PAGEERROR: {e}'))
    await pg.goto('file://'+D+'test.html');await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{window.__t.credits();return 0})()");await pg.wait_for_timeout(4200)
    await pg.screenshot(path=D+f'shots/{tag}_cr1.png')
    await pg.keyboard.down('Space');await pg.wait_for_timeout(7000);await pg.keyboard.up('Space')
    await pg.wait_for_timeout(2500)
    if not mobile: await pg.screenshot(path=D+f'shots/{tag}_cr2.png')
    await pg.keyboard.down('Space');await pg.wait_for_timeout(5200);await pg.keyboard.up('Space');await pg.wait_for_timeout(1800)
    await pg.screenshot(path=D+f'shots/{tag}_cr3.png')
    print(tag,await pg.evaluate("window.__t.cr()"))
    if not mobile:
        await pg.keyboard.down('Space');await pg.wait_for_timeout(9500);await pg.keyboard.up('Space');await pg.wait_for_timeout(1800)
        await pg.screenshot(path=D+f'shots/{tag}_cr4.png')
    print(tag,'errors:',errs[:10]);await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,1440,900,'d',False)
        await run(p,390,844,'m',True)
asyncio.run(main())
